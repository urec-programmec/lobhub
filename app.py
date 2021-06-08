from flask import Flask, render_template, request, redirect, session, url_for, flash, jsonify
from assets.Comein import Comein
from assets.Register import Register
from assets.Createlobby import Createlobby
from assets.Uppload import Upload
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, join_room, leave_room
import hashlib
import os, random
from math import ceil
from faker import Factory


app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:pass@localhost/lobhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.String(10), unique=False, nullable=False)
    lobbies = db.relationship('Lobbies', backref='member', lazy='dynamic')

    def __repr__(self):
        return '<Users %r>' % self.id


class Lobbies(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.Integer, db.ForeignKey('users.id'))
    type = db.Column(db.Integer, db.ForeignKey('type.id'))
    color = db.Column(db.String(10), unique=False, nullable=False)
    keycode = db.Column(db.String(32), unique=False, nullable=False)
    results = db.relationship('Result', backref='ender', lazy='dynamic')

    def __repr__(self):
        return '<Lobbies %r>' % self.id


class Type(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    count_tasks = db.Column(db.Integer, primary_key=False)
    count_mobs = db.Column(db.Integer, primary_key=False)
    map = db.Column(db.LargeBinary, primary_key=False)
    map_img = db.Column(db.LargeBinary(length=(2**24)-1), primary_key=False)
    fone_img = db.Column(db.LargeBinary(length=(2**24)-1), primary_key=False)
    lobbies = db.relationship('Lobbies', backref='creater', lazy='dynamic')

    def __repr__(self):
        return '<Type %r>' % self.id


class Result(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('lobbies.id'), primary_key=True)
    status = db.Column(db.String(50), unique=False, nullable=False)
    time = db.Column(db.BigInteger, unique=False, nullable=False)

    def __repr__(self):
        return '<Result %r>' % self.id


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.LargeBinary(length=(2 ** 24) - 1), primary_key=False)
    answer = db.Column(db.String(255), unique=False, nullable=False)

    def __repr__(self):
        return '<Task %r>' % self.id


class u_in_l(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    lobbie_id = db.Column(db.Integer, primary_key=True)
    X = db.Column(db.Integer, primary_key=False)
    Y = db.Column(db.Integer, primary_key=False)
    color = db.Column(db.String(10), primary_key=False)

    def __repr__(self):
        return '<UL %r>' % str(self.user_id) + " " + str(self.lobbie_id)


class r_in_t(db.Model):
    type_id = db.Column(db.Integer, db.ForeignKey('type.id'), primary_key=True)
    X = db.Column(db.Integer, primary_key=True)
    Y = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return '<RT %r>' % str(self.user_id) + " " + str(self.lobbie_id)


class t_in_l(db.Model):
    lobbie_id = db.Column(db.Integer, db.ForeignKey('lobbies.id'), primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), primary_key=True)
    status = db.Column(db.String(15), primary_key=False)
    resolver = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=False, nullable=True)
    X = db.Column(db.Integer, primary_key=False)
    Y = db.Column(db.Integer, primary_key=False)
    type = db.Column(db.String(15), primary_key=False)

    def __repr__(self):
        return '<TL %r>' % str(self.user_id) + " " + str(self.lobbie_id)

def socket_users(key):
    ul = u_in_l.query.filter_by(lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).all()
    users = []
    for i in ul:
        users.append({
            'name': Users.query.get(i.user_id).name,
            'X': i.X,
            'Y': i.Y,
            'color': i.color})
    return users

@socketio.on('start')
def start(data):
    room = data['key']
    join_room(room)
    send(socket_users(room), to=room)

@socketio.on('task')
def task(data):
    lobbie_id = Lobbies.query.filter_by(keycode=data['key']).first().id
    task_id = data['task']
    resolver = Users.query.filter_by(name=data['resolver']).first().id
    status = data['status']

    tl = t_in_l.query.filter_by(lobbie_id=lobbie_id, task_id=task_id).first()
    if tl.status == 'INITIAL' or (tl.status == 'IN PROGRESS' and status == 'OK'):
        tl.resolver = resolver
        tl.status = status
        db.session.commit()
    tasks = t_in_l.query.filter_by(lobbie_id=Lobbies.query.filter_by(keycode=data['key']).first().id).all()

    tasks = {'data':[[i.task_id, i.X, i.Y, (Task.query.get(i.task_id).answer if t_in_l.query.filter_by(
        lobbie_id=Lobbies.query.filter_by(keycode=data['key']).first().id,
        task_id=i.task_id).first().status != 'OK' else 'OK'), i.type] for i in tasks]}

    send(tasks, to=data['key'])

@socketio.on('go')
def go(data):
    # print(data)
    key = data['key']
    x = data['X']
    y = data['Y']

    ul = u_in_l.query.filter_by(user_id=Users.query.filter_by(name=session['name']).first().id,
                                lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).first()
    ul.X = x
    ul.Y = y

    db.session.commit()
    send(socket_users(key), to=key)

@socketio.on('end')
def end(data):
    room = data['key']
    leave_room(room)
    leavelobbie()
    session.pop('key', None)
    send(socket_users(room), to=room)


@app.route('/', methods=['GET', 'POST'])
def comein():
    if session.get('name'):
        return redirect('/lobbies')
    form = Comein()
    if request.method == "POST":
        if form.validate_on_submit():
            name = form.login.data
            user = Users.query.filter_by(name=name).first()
            if user and user.name == name:
                color = Factory.create().hex_color()
                r, g, b = tuple(int(color.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
                text_color = '#000000' if (r*0.299 + g*0.587 + b*0.114) > 150 else '#ffffff'
                session['name'] = form.login.data
                session['role'] = Users.query.filter_by(name=form.login.data).first().type
                session['color'] = color
                session['r'] = r
                session['g'] = g
                session['b'] = b
                session['textColor'] = text_color
                return redirect('/lobbies')
            else:
                flash('nickname does not exist')

    return render_template("comein.html", form=form)


@app.route('/fastregister', methods=['GET', 'POST'])
def fastregister():
    if session.get('name'):
        return redirect('/lobbies')
    form = Register()
    if request.method == "POST":
        if form.validate_on_submit():
            name = form.login.data
            type = form.role.data
            if not Users.query.filter_by(name=name).first() and name != 'hero' and name != 'hero2':
                user = Users(name=name, type=type)
                db.session.add(user)
                db.session.commit()
                return redirect('/')
            else:
                flash('nickname does exist yet')

    return render_template("fastregister.html", form=form)


@app.route('/lobbies', methods=['GET', 'POST'])
def lobbies():
    if not session.get('name'):
        return redirect('/')

    if session.get('key'):
        return redirect('lobbie/' + session['key'])

    return render_template("lobbies.html", lobbies=Lobbies, ul=u_in_l, users=Users, user=None, me=session['name'])



@app.route('/mylobbies', methods=['GET', 'POST'])
def mylobbies():
    if not session.get('name'):
        return redirect('/')
    return render_template("lobbies.html", lobbies=Lobbies, ul=u_in_l, users=Users, user=Users.query.filter_by(name=session['name']).first().id, me=session['name'])


@app.route('/createlobby', methods=['GET', 'POST'])
def createlobby():
    if not session.get('name'):
        return redirect('/')
    form = Createlobby()
    owners = [(i.id, i.name) for i in Users.query.filter_by(type='teacher').all()]
    form.owmer.choices = owners
    tasks = [i.id for i in Task.query.all()]
    max_cnt = [i.count_tasks for i in Type.query.all()]
    for i in tasks:
        with open(os.path.join(app.root_path, 'static/source/tasks/task' + str(i) + '.jpg'), 'wb') as file:
            file.write(Task.query.get(i).data)

    if request.method == "POST":
        if form.validate_on_submit():
            ts = [i[4:] for i in form.tasks.data.split(',')]
            color = Factory.create().hex_color()
            lobbie = Lobbies(owner=form.owmer.data, type=form.type.data, color=color,
                            keycode=hashlib.md5((color + str(form.owmer.data)).encode()).hexdigest())
            db.session.add(lobbie)
            rt = r_in_t.query.filter_by(type_id=form.type.data).all()
            choosen = []
            for i in ts:
                xy = random.choice(rt)
                while [xy.X, xy.Y, i] in choosen:
                    xy = random.choice(rt)
                choosen.append([xy.X, xy.Y, i])

            counter = 0
            for i in choosen:
                tl = t_in_l(lobbie_id=lobbie.id, task_id=i[2], status='INITIAL', X=i[0], Y=i[1], type='sand' if counter % 3 == 0 else ('wick' if counter % 3 == 1 else 'powred'))
                counter += 1
                db.session.add(tl)

            db.session.commit()
            return redirect('/lobbies')

    return render_template("createlobby.html", form=form, tasks=tasks, str=str, max_cnt=max_cnt)


@app.route('/deletelobbie/<string:key>')
def deletelobbie(key):
    if not session.get('name'):
        return redirect('/')

    print(key)
    print(Lobbies.query.filter_by(keycode=key).first())
    id = Lobbies.query.filter_by(keycode=key).first().id
    for i in u_in_l.query.filter_by(lobbie_id=id).all():
        db.session.delete(i)

    for i in t_in_l.query.filter_by(lobbie_id=id).all():
        db.session.delete(i)

    db.session.delete(Lobbies.query.get(id))
    db.session.commit()
    print('all')
    return redirect("/mylobbies")


@app.route('/lobbie/<string:key>', methods=['GET', 'POST'])
def lobbie(key):
    if not session.get('name'):
        return redirect('/')

    type = Type.query.get(Lobbies.query.filter_by(keycode=key).first().type)
    tasks = t_in_l.query.filter_by(lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).all()

    for i in tasks:
        with open(os.path.join(app.root_path, 'static/source/lobbie-tasks/task' + str(i.task_id) + '.jpg'), 'wb') as file:
            file.write(Task.query.get(i.task_id).data)

    tasks = [[i.task_id, i.X, i.Y, (Task.query.get(i.task_id).answer if t_in_l.query.filter_by(
        lobbie_id=Lobbies.query.filter_by(keycode=key).first().id,
        task_id=i.task_id).first().status != 'OK' else 'OK'), i.type] for i in tasks]

    with open(os.path.join(app.root_path, 'static/source/maps/map' + key + '.jpg'), 'wb') as file:
        file.write(type.map_img)

    with open(os.path.join(app.root_path, 'static/source/fones/fone' + key + '.jpg'), 'wb') as file:
        file.write(type.fone_img)

    text_color = 'rgba(0, 0, 0, 0.1)' if (session['r'] * 0.299 + session['g'] * 0.587 + session['b'] * 0.114) > 150 else 'rgba(255, 255, 255, 0.1)'
    session['key'] = key

    user_id = Users.query.filter_by(name=session['name']).first().id
    lobbie_id = Lobbies.query.filter_by(keycode=key).first().id
    maybe = u_in_l.query.filter_by(user_id=user_id, lobbie_id=lobbie_id).first()
    # print(maybe)
    if maybe:
        maybe.color = session['color']
        db.session.commit()
    else:
        ul = u_in_l(user_id=user_id, lobbie_id=lobbie_id, X=3, Y=21, color=session['color'])
        db.session.add(ul)
        db.session.commit()
        # print(ul)

    # print(type.map.decode())

    return render_template("lobbie.html",
                           key=key,
                           map=type.map.decode(),
                           user=session['name'],
                           color=session['color'],
                           text_color=text_color,
                           len=len,
                           ceil=ceil,
                           L=Lobbies,
                           U=Users,
                           UL=u_in_l,
                           TL=t_in_l,
                           Ta=Task,
                           tasks=tasks)


@app.route('/lobbieinfo/<string:key>', methods=['GET', 'POST'])
def lobbyinfo(key):
    if not session.get('name'):
        return redirect('/')

    tasks = [[str(i.task_id), i.status, i.resolver] for i in t_in_l.query.filter_by(lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).all()]

    for i in tasks:
        with open(os.path.join(app.root_path, 'static/source/lobbie-tasks/task' + str(i[0]) + '.jpg'),
                  'wb') as file:
            file.write(Task.query.get(i[0]).data)

    return render_template("lobbieinfo.html", key=key, lobbies=Lobbies, ul=u_in_l, users=Users, user=None, type=Lobbies.query.filter_by(keycode=key).first().type, tasks=tasks)


@app.route('/leavelobbie', methods=['GET', 'POST'])
def leavelobbie():
    user_id = Users.query.filter_by(name=session['name']).first().id
    lobbie_id = Lobbies.query.filter_by(keycode=session['key']).first().id
    maybe = u_in_l.query.filter_by(user_id=user_id, lobbie_id=lobbie_id).first()
    if maybe:
        db.session.delete(maybe)
        db.session.commit()

    session.pop('key', None)
    return redirect('/lobbies')






@app.route('/logout')
def logout():
    session.pop('name', None)
    session.pop('role', None)
    session.pop('r', None)
    session.pop('g', None)
    session.pop('b', None)
    session.pop('color', None)
    session.pop('textColor', None)
    session.pop('key', None)
    return redirect('/')


@app.route('/savestate', methods=['GET', 'POST'])
def savestate():
    key = request.form['key']
    x = request.form['x']
    y = request.form['y']

    ul = u_in_l.query.filter_by(user_id=Users.query.filter_by(name=session['name']).first().id, lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).first()
    ul.X = x
    ul.Y = y
    # print(x, " ", y)

    db.session.commit()

    return jsonify({'result': 'ok'})


@app.route('/refresh/<string:key>', methods=['GET', 'POST'])
def refresh(key):

    ul = u_in_l.query.filter_by(lobbie_id=Lobbies.query.filter_by(keycode=key).first().id).all()
    users = []
    for i in ul:
        users.append({
        'name':  Users.query.get(i.user_id).name,
        'X': i.X,
        'Y': i.Y,
        'color': i.color})

    return jsonify(users)


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    form = Upload()

    if request.method == "POST":
        # print('ok')
        file = request.files['input']
        t = Type.query.get(form.type.data)
        # print(file.read())
        t.map = file.read()
        # task = Task(data=file.read())

        # db.session.add(task)
        db.session.commit()
        # print(Type.query.get(form.type.data).map)
    # ts = Task.query.get(19)

    # with open(os.path.join(app.root_path, 'static/source/bg.jpg'), 'wb') as file:
    #         file.write(ts.data)

    return render_template("upload.html", form=form, )


if __name__ == "__main__":
    socketio.run(app, port=8090, host='127.0.0.1', debug=True)
