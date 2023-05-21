import Exercise5 as Ex5
from bitarray import bitarray
import pycrc
import random

""" A) i)
1.1 - texto "alice29.txt" -> BER (0.0995, 0.1, 0.1, 0.1, 0.099) -> n de bits (1187856)
1.2 - texto "Person.java" -> BER (0.0901, 0.0989, 0.1029, 0.0942, 0.0995) -> n de bits (50720)
1.3 - texto "progc.c" -> BER (0.1004, 0.0981, 0.100, 0.101, 0.102) -> n de bits (316896)
1.4 - texto "cp.htm" -> BER (0.0984, 0.105, 0.0997, 0.0984, 0.0963) -> n de bits (196824)

2.1 - texto "alice29.txt" -> BER (0.0097, 0.0095, 0.01, 0.00993, 0.0096) com BER 10^-2
2.2 - texto "Person.java" -> BER (0.0115, 0.0110, 0.0084, 0.0101, 0.0101) com BER 10^-2
2.3 - texto "progc.c" -> BER (0.010059) com BER 10^-2
2.4 - texto "cp.htm" -> BER (0.009897) com BER 10^-2

3.1 - texto "alice29.txt -> BER (0.00099849)
3.2 - texto "Person.java -> BER (0.0011456)
3.3 - texto "progc.c" -> BER (0.0009694)
3.4 - texto "cp.htm" -> BER (0.000975)

4.1 - texto "alice29.txt" -> BER (0.00010035)
4.2 - texto "Person.java" -> BER (0.0001322)
4.3 - texto "progc.c" -> BER (0.00009178)
4.4 - texto "cp.htm" -> BER (0.0001208)

5.1 - texto "alice29.txt" -> BER (0.00000836)
5.2 - texto "Person.java" -> BER (0.00004406)
5.3 - texto "progc.c" -> BER (0.00004406)
5.4 - texto "cp.htm" -> BER (0.0000258866)
"""

""" A) ii)
1.1 - texto "alice29.txt" -> BER (0.01586) com BER 10^-1
1.2 - texto "Person.java" -> BER (0.017133) com BER 10^-1
1.3 - texto "progc.c" -> BER (0.016297) com BER 10^-1 
1.4 - texto "cp.htm" -> BER (0.014459) com BER 10^-1

2.1 - texto "alice29.txt" -> BER (0.0001694) com BER 10^-2
2.2 - texto "Person.java" -> BER (0.0002011) com BER 10^-2
2.3 - texto "progc.c" -> BER (0.0001616) com BER 10^-2
2.4 - texto "cp.htm" -> BER (0.0001677) com BER 10^-2

3.1 - texto "alice29.txt -> BER (0.0000023572)
3.2 - texto "Person.java -> BER (0.000003943)
3.3 - texto "progc.c" -> BER (0.0000018934)
3.4 - texto "cp.htm" -> BER (0.0000020323)

4.1 - texto "alice29.txt" -> BER (0.0)
4.2 - texto "Person.java" -> BER (0.0)
4.3 - texto "progc.c" -> BER (0.0)
4.4 - texto "cp.htm" -> BER (0.0)

5.1 - texto "alice29.txt" -> BER (0.0)
5.2 - texto "Person.java" -> BER (0.0)
5.3 - texto "progc.c" -> BER (0.0)
5.4 - texto "cp.htm" -> BER (0.0)

"""

d = {'1': bitarray('111'), '0': bitarray('000')}

def encodeHamming(message):
    # Verify message length
    if len(message) != 4:
        raise ValueError("El mensaje binario debe tener una longitud de 4 bits.")

    # Calculate bits p1, p2 and p4
    p1 = message[0] ^ message[1] ^ message[3]
    p2 = message[0] ^ message[2] ^ message[3]
    p4 = message[1] ^ message[2] ^ message[3]

    # Assemble the encoded message with the p bits and the message bits
    encoded_message = [p1, p2, message[0], p4, message[1], message[2], message[3]]

    return encoded_message


def decodeHamming(encoded_message):
    # Verify encoded_message length
    if len(encoded_message) != 7:
        raise ValueError("El mensaje codificado debe tener una longitud de 7 bits.")

    # Calculate bits p1, p2 and p4
    p1 = encoded_message[0] ^ encoded_message[2] ^ encoded_message[4] ^ encoded_message[6]
    p2 = encoded_message[1] ^ encoded_message[2] ^ encoded_message[5] ^ encoded_message[6]
    p4 = encoded_message[3] ^ encoded_message[4] ^ encoded_message[5] ^ encoded_message[6]

    # Check if there is any error and correct it
    error_bit = p4 * 4 + p2 * 2 + p1
    if error_bit != 0:
        #print("An error has been found in bit:", error_bit)
        # Correct the wrong bit
        encoded_message[error_bit - 1] = 1 - encoded_message[error_bit - 1]

    # Decode the message
    decoded_message = [encoded_message[2], encoded_message[4], encoded_message[5], encoded_message[6]]

    return decoded_message

def encode(text):
    arr = bitarray()
    arr.encode(d, text)
    return arr


def decode(text):
    decoded_bits = bitarray()
    for i in range(0, len(text), 3):
        bit_slice = text[i:i + 3]
        if bit_slice.count('1') > 3 / 2:
            decoded_bits.append(True) #append de enteros
        else:
            decoded_bits.append(False)
    return decoded_bits


def repetition_code_bsc(errorProbability):
    loops = 0
    media = 0
    file = open("/home/valentin/VSCPython/alice29.txt", "r", encoding="ISO-8859-1")
    text = Ex5.to_binary(file.read()).replace(" ", "")
    while loops < 1:
        enc_text = encode(text)
        interference = Ex5.bsc(enc_text, errorProbability)
        dec_text = decode(interference)
        media, counter = Ex5.ber_calculator(str(text), str(dec_text.to01()))
        loops += 1
    file.close()
    print("N of total bits = ", len(dec_text.to01()))
    print("N of different bits = ", counter)
    print("Bit Error Rate = ",media)
    return media



def hamming_coding_encoding_bsc(errorProbability):
    file = open("/home/valentin/VSCPython/alice29.txt", "r", encoding="ISO-8859-1")
    text = Ex5.to_binary(file.read()).replace(" ", "")
    enc_text=bitarray() # here you append the parts of the encoding
    dec_text=bitarray() # here you append the parts of the decoding
    i=0
    message=bitarray() # auxiliar bitarray for the hamming 7,4 encoding
    while(i<len(text)): #its not the same with the repetition code because the dictionary would have 64 different entries
        message =[int(text[i]),int(text[i+1]),int(text[i+2]),int(text[i+3])]
        chunk_to_encode=encodeHamming(message)
        for j in range(0,7): #the encoding has 7 bits
            enc_text.append(chunk_to_encode[j])                            
        i+=4
    interference = Ex5.bsc(enc_text, errorProbability)
    i=0
    encoded_interference=bitarray()
    while(i<len(interference)):
        encoded_interference=[int(interference[i]),int(interference[i+1]),int(interference[i+2]),int(interference[i+3]),int(interference[i+4]),int(interference[i+5]),int(interference[i+6])]
        chunk_to_decode = decodeHamming(encoded_interference)
        for j in range(0,4):
            dec_text.append(chunk_to_decode[j])
        i+=7
    media, counter = Ex5.ber_calculator(str(text), str(dec_text.to01()))
    file.close()
    print("N of total bits = ", len(dec_text.to01()))
    print("N of different bits = ", counter)
    print("Bit Error Rate = ",media)
    return media


def main():
    errorProbability=0.01
    berRep = repetition_code_bsc(errorProbability)
    berHam = hamming_coding_encoding_bsc(errorProbability)
    if(berRep<berHam):
        print("Repetition Code has less BER than Hamming with the same error probability")
    else:
        print("Hamming has less BER than Repetition Code with the same error probability")


if __name__ == "__main__":
    main()
