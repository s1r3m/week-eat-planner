import asyncio
import os
from xmlrpc.server import SimpleXMLRPCServer

from week_eat_planner.db.session_maker import db

from .methods import check_db_isolation, remove_user

server = SimpleXMLRPCServer(
    ('0.0.0.0', 9000),
    allow_none=True,
    use_builtin_types=True,
)

server.register_function(check_db_isolation)
server.register_function(remove_user)

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
database_initialized = False
try:
    loop.run_until_complete(db.init(os.environ['DB_URL']))
    database_initialized = True
    server.serve_forever()
finally:
    server.server_close()
    try:
        if database_initialized:
            loop.run_until_complete(db.close())
    finally:
        loop.close()
        asyncio.set_event_loop(None)
