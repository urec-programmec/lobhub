from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, FieldList
from wtforms.validators import DataRequired, InputRequired


class Createlobby(FlaskForm):
    owmer = SelectField('owner: ', coerce=int, validators=[InputRequired()])
    type = SelectField("type: ", validators=[DataRequired()], choices=[('1', 'easy'), ('2', 'normal'), ('3', 'hard')])
    tasks = StringField('tasks', validators=[DataRequired()])
    submit = SubmitField("create lobbie")
