from flask_wtf import FlaskForm
from wtforms import SubmitField, FileField, IntegerField


class Upload(FlaskForm):
    type = IntegerField("type: ")
    file = FileField("file: ")
    submit = SubmitField("upload")
