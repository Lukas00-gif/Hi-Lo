# server.py (Flask)

from flask import Flask, request, jsonify
from comparador import comparar_codigo

app = Flask(__name__)

@app.route('/enviar_resposta_atividade', methods=['POST'])
def enviar_resposta_atividade():
    # Receba os dados do cliente
    data = request.json

    # Código do professor e código do aluno
    #basicamente vai ser assim mais tem que colocar para dar certo
    codigo_professor = obter_codigo_professor(data.get('id_atividade'))
    codigo_aluno = data.get('codigo_aluno')

    # Comparar códigos
    resultado_comparacao = comparar_codigo(codigo_professor, codigo_aluno)

    # Retorne o resultado para o cliente
    return jsonify({'resultado_comparacao': resultado_comparacao})

if __name__ == '__main__':
    app.run(debug=True)
