import numpy as np
import json
from flask import Flask, request
app = Flask(__name__)


@app.route('/', methods=['GET'])
def main():
    if request.method == 'GET':
        try:
            num_mines = request.args.get('mines', '')
            num_forest = request.args.get('forest', '')
            num_mountain = request.args.get('mountain', '')

            mean = [10] * 100
            # cov = [[0 for _ in range(100)] for _ in range(100)]
            cov = np.identity(100)

            # generate the values for the squares
            squares = np.random.multivariate_normal(mean, cov)

            # designate square terrain based on values
            square_array = np.array(squares)

            partition = np.argpartition(square_array, -1*num_mines)
            mines = partition[-1*num_mines:].tolist()
            remaining = square_array[partition[:-1*num_mines]]

            partition = np.argpartition(remaining, -1*num_forest)
            forest = partition[-1*num_forest:].tolist()
            remaining = square_array[partition[:-1*num_forest]]

            partition = np.argpartition(remaining, -1*num_mountain)
            mountains = partition[-1*num_mountain:].tolist()
            sea = partition[:-1*num_mountain].tolist()
            return(json.dumps({"mines": mines, "sea": sea, "forest": forest, "mountains": mountains}))
        except Exception:
            return Exception
