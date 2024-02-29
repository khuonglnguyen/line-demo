from line_notify import LineNotify
import time

ACCESS_TOKEN = "RzC8djFmhR129AUQZGGy684ZhttTa1BRnzUY5imSxQQ"

notify = LineNotify(ACCESS_TOKEN)

notify.send("test")
# for x in range(1):
#     time.sleep(1)
#     notify.send("test")
