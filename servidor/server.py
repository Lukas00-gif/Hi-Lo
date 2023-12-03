from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

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
    codigo_professor = data['codigoProfessor']
    codigo_aluno = data['codigoAluno']

    comparador_path = os.path.join(os.path.dirname(__file__), 'comparador.py')

    try:
        # Chama o script de comparação usando subprocess
        resultado = subprocess.check_output(['python', comparador_path , codigo_professor, codigo_aluno], text=True)
        # return jsonify({'resultado': resultado.strip()})

        if resultado.strip().lower() == 'iguais':
            return jsonify({'resultado' : 'Os Codigos Sao Iguais'})
        else:
            return jsonify({'resultado' : 'OS CODIGOS NAO SAO IGUAIS'})
        
    except subprocess.CalledProcessError as e:
        return jsonify({'erro': f"Erro ao executar o comparador: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
