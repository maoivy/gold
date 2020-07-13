import numpy as np
import json
from flask import Flask, request
app = Flask(__name__)


@app.route('/', methods=['GET'])
def main():
    if request.method == 'GET':
        try:
            total = int(request.args.get('total', ''))
            num_mines = int(request.args.get('mines', ''))
            num_forest = int(request.args.get('forest', ''))
            num_mountain = int(request.args.get('mountain', ''))

            mean = [10] * total
            cov = np.identity(total)

            # generate the values for the squares
            squares = np.random.multivariate_normal(mean, cov)

            # designate square terrain based on values
            square_array = np.array(squares)

            partition = np.argpartition(
                square_array, [-1*num_mines, -1*(num_mines+num_forest), -1*(num_mines+num_forest+num_mountain)])
            mines = partition[-1*num_mines:].tolist()
            forest = partition[-1*(num_mines+num_forest):-1*num_mines].tolist()
            mountain = partition[-1*(num_mines+num_forest+num_mountain)
                                     :-1*(num_mines+num_forest)].tolist()
            sea = partition[:-1*(num_mines+num_forest+num_mountain)].tolist()

            return json.dumps({"mines": mines, "forest": forest, "mountain": mountain, "sea": sea})
        except:
            return json.dumps("Error")


if __name__ == '__main__':
    app.run()
