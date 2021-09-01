from sqlalchemy import create_engine

engine = create_engine('mysql+mysqlconnector://root:pass@192.168.64.2/lobhub')
com = engine.connect()

res = com.execute('SELECT * FROM users')
print(res)