from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import re

app = Flask(__name__)
CORS(app, origins="http://localhost:8080")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    return response

@app.route('/comparar-codigos', methods=['POST'])
def comparar_codigos():
    data = request.get_json()
    codigo_professor = data['saidaEsperadaProfessor']
    codigo_aluno = data['codigoAluno']

    print('1 - codigo vindo do professor: ', codigo_professor)
    print('2 - codigo vindo do aluno: ', codigo_aluno)

    # Salve o código do aluno em um arquivo temporário
    aluno_file_path = "aluno_codigo.py"
    with open(aluno_file_path, 'w') as file:
        file.write(codigo_aluno)

    # Chame o script do aluno usando subprocess para executar o código
    try:
        resultado_aluno = subprocess.check_output(['python', aluno_file_path], text=True)
        resultado_aluno = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', resultado_aluno)  # Remove caracteres de controle
        print('3 - codigo vindo do resultado do subprocess:',resultado_aluno)
        print('---------------------------------------------------------------')

        # Faça a comparação dos resultados
        if resultado_aluno == codigo_professor:
            return jsonify({'resultado': 'Os Códigos São Iguais'})
        else:
            return jsonify({'resultado': 'Os Códigos NAO são Iguais'})

    except subprocess.CalledProcessError as e:
        return jsonify({'erro': f"Erro ao executar o código do aluno: {e}"}), 500

    finally:
        # Exclua o arquivo temporário do aluno após a execução
        os.remove(aluno_file_path)

if __name__ == '__main__':
    app.run(debug=True)
