from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length


class Comein(FlaskForm):
    login = StringField("Игровое имя: ", validators=[DataRequired(), Length(min=1, max=20)])
    submit = SubmitField("Войти на тренировочную площадку")
