from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField
from wtforms.validators import DataRequired, Length


class Register(FlaskForm):
    login = StringField("nickname: ", validators=[DataRequired(), Length(min=1, max=20)])
    role = SelectField("role: ", validators=[DataRequired()], choices=[('student', 'student'), ('teacher', 'teacher')])
    submit = SubmitField("register")
