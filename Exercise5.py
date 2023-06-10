import random as rand


def bsc_with_interleaving(text, ber_value, rows, columns):
    interleaved_value = interleave(text, rows, columns)
    bsc_value = model_bsc(interleaved_value, ber_value)
    return interleave(to_char(bsc_value), columns, rows)


def model_bsc(text, ber_value):
    file_content_binary = to_binary(text)
    interference = bsc(file_content_binary, ber_value)
    print()
    print("real BER  -> " + str(ber_calculator(file_content_binary, interference)))
    print()
    return interference


def to_char(binary_string):
    binary_list = binary_string.split()
    return ''.join([chr(int(binary, 2)) for binary in binary_list])


def to_binary(text):
    return ' '.join(format(ord(x), 'b').zfill(8) for x in text)


def bsc(binary, prob):
    interference = ""
    for x in binary:
        if x == " ":
            interference += " "
            continue
        is_wrong = rand.random() < prob
        bit = x
        if is_wrong:
            bit = invert_value(bit)
        interference += str(bit)
    return interference


def ber_calculator(s1, s2):
    counter = 0
    string1 = s1.replace(" ", "")
    string2 = s2.replace(" ", "")
    for i in range(len(string1)):
        if string1[i] != string2[i]:
            counter += 1
    return counter / len(string1), counter


def invert_value(x):
    if x == "1":
        return 0
    return 1


def interleave(input_sequence, num_rows, num_cols):

    matrix_size = num_rows * num_cols

    interleaving_matrix = [[None for j in range(num_cols)] for i in range(num_rows)]

    for i in range(len(input_sequence)):
        row = i % num_rows
        col = i // num_rows
        interleaving_matrix[row][col] = input_sequence[i]

    output_sequence = ""

    for i in interleaving_matrix:
        for x in i:
            output_sequence += str(x)

    return output_sequence


def main():
    file = open("./TestFilesCD/a.txt", "r")
    file_content = file.read()
    file_content_binary = to_binary(file_content)
    ber = 0.7
    interference = model_bsc(file_content, ber)

    print("original     -> " + str(file_content_binary))
    print("Interference -> " + interference)

    print()
    text = "ExemploDeTransmissaoInterleaving"
    inter = interleave(text, 4, 8)

    print("value passed   -> " + text)
    print("value expected -> " + interleave(inter, 8, 4))
    print()

    file = open("interleavingtest.txt", "r")
    file_content = file.read()
    print("tamanho do ficheiro -> " + str(len(file_content)))
    print("ber with 60 50 matrix")
    bsc_with_interleaving(file_content, ber, 60, 50)
    print("ber with 8 375 matrix")
    bsc_with_interleaving(file_content, ber, 8, 375)


    """
    inter2 = interleave(text, 1, 128)
    print("interleaving 1 128")
    print("value passed   -> " + text)
    print("value returned -> " + bsc_with_interleaving(text, ber, 1, 128))
    print("value expected -> " + interleave(inter2, 128, 1))

    columns = int(len(file_content)/5)
    inter = interleave(file_content, 5, columns)
    print("value passed   -> " + file_content)
    print("value returned -> " + bsc_with_interleaving(file_content, ber, 5, columns))
    print("value expected -> " + interleave(inter, columns, 5))
    """

if __name__ == "__main__":
    main()
