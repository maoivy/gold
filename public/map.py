import sys
import json
import numpy as np

# def main():
num_mines = 10
num_forest = 20
num_mountain = 30
num_sea = 40

mean = [10] * 100
# cov = [[0 for _ in range(100)] for _ in range(100)]
cov = np.identity(100)

# generate the values for the squares
squares = np.random.multivariate_normal(mean, cov)

# designate square terrain based on values
square_array = np.array(squares)

partition = np.argpartition(square_array, -1*num_mines)
mines = partition[-1*num_mines:]
remaining = square_array[partition[:-1*num_mines]]

partition = np.argpartition(remaining, -1*num_forest)
forest = partition[-1*num_forest:]
remaining = square_array[partition[:-1*num_forest]]

partition = np.argpartition(remaining, -1*num_mountain)
mountains = partition[-1*num_mountain:]
sea = square_array[partition[:-1*num_mountain]]

mystatus = "200 OK"

sys.stdout.write("Status: %s\n" % mystatus)
sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n\n")
sys.stdout.write(json.dumps(
    {mines: mines, sea: sea, forest: forest, mountains: mountains}))
# return json.dumps(
#     {mines: mines, sea: sea, forest: forest, mountains: mountains})


# if __name__ == "__main__":
#     return main()
