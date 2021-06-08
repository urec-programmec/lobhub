from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length


class Comein(FlaskForm):
    login = StringField("nickname: ", validators=[DataRequired(), Length(min=3, max=10)])
    submit = SubmitField("come in")
