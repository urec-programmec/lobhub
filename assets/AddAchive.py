from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, FieldList
from wtforms.validators import DataRequired, InputRequired


class AddAchive(FlaskForm):
    user = SelectField('user: ', coerce=int, validators=[InputRequired()])
    achive = SelectField("achive: ", validators=[DataRequired()], choices=[('1', 'Душа отряда'), ('2', 'Стратегия'), ('3', 'Активность'), ('4', 'Преобразование'), ('5', 'Креативность'), ('6', 'Спорт')])
    submit = SubmitField("add achive")
