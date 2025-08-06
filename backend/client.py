from dotenv import load_dotenv
load_dotenv()
import os
from datetime import datetime

import os
from schwab.auth import easy_client

def get_client():
    return easy_client(
        api_key=os.getenv("api_key"),
        app_secret=os.getenv("app_secret"), 
        callback_url=os.getenv("callback_url"),
        token_path=os.getenv("token_path")
    )


# Follow the instructions on the screen to authenticate your client.
""" c = easy_client(
        api_key=os.getenv("api_key"),
        app_secret=os.getenv("app_secret"),
        callback_url=os.getenv("callback_url"),
        token_path=os.getenv("token_path")) """

""" resp = c.get_price_history_every_day('AAPL')
assert resp.status_code == httpx.codes.OK
history = resp.json() 
with open("stock.json", "w") as f:
    json.dump(history, f, indent=4) """

#############################################################################

