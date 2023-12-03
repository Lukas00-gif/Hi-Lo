# import difflib
# import sys

# def comparar_codigos(codigo_professor, codigo_aluno):
#     comparador = difflib.Differ()
#     diferencas = comparador.compare(codigo_professor.splitlines(), codigo_aluno.splitlines())
#     resultado = '\n'.join(diferencas)
#     return resultado

# if __name__ == '__main__':
#     if len(sys.argv) == 3:
#         codigo_professor = sys.argv[1]
#         codigo_aluno = sys.argv[2]
#         resultado_comparacao = comparar_codigos(codigo_professor, codigo_aluno)
#         print(resultado_comparacao)
#     else:
#         print("Uso: python comparador.py <codigo_professor> <codigo_aluno>")

import difflib
import sys

def comparar_codigos(codigo_professor, codigo_aluno):
    # Realize a comparação dos códigos
    d = difflib.Differ()
    diff = list(d.compare(codigo_professor.splitlines(), codigo_aluno.splitlines()))

    # Verifique se há diferenças e retorne 'iguais' se não houver
    if any(line.startswith(('+', '-')) for line in diff):
        return 'diferentes'
    else:
        return 'iguais'

if __name__ == "__main__":
    # Certifique-se de ter dois argumentos (código do professor e código do aluno)
    if len(sys.argv) == 3:
        codigo_professor = sys.argv[1]
        codigo_aluno = sys.argv[2]

        resultado = comparar_codigos(codigo_professor, codigo_aluno)
        print(resultado)
    else:
        print("Uso: python comparador.py [código_professor] [código_aluno]")


