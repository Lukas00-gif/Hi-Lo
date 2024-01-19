import unittest
import json
from server import app  # Substitua 'your_app_file' pelo nome real do arquivo do seu aplicativo

class TestComparacaoDeCodigos(unittest.TestCase):
    def setUp(self):
        # Configuração inicial para criar uma instância do aplicativo e do cliente de teste
        app.config['TESTING'] = True
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_comparar_codigos(self):
        # Dados de exemplo para o teste
        data = {
            'saidaEsperadaProfessor': 'Hello, World!',
            'codigoAluno': 'print("Hello, World!")'
        }

        # Converte os dados para o formato JSON
        data_json = json.dumps(data)

        # Chama a rota '/comparar-codigos' com o método POST
        response = self.app.post('/comparar-codigos',
                                data=data_json,
                                content_type='application/json')

        # Converte a resposta de JSON para um dicionário
        result = json.loads(response.data.decode('utf-8'))

        # Verifica se a resposta é 'Os Códigos São Iguais'
        self.assertEqual(result['resultado'], 'Os Códigos São Iguais', msg="Os códigos não são iguais")

if __name__ == '__main__':
    # Executa o teste e imprime uma mensagem de aprovação ou falha
    result = unittest.TextTestRunner().run(unittest.TestLoader().loadTestsFromTestCase(TestComparacaoDeCodigos))

    if result.wasSuccessful():
        print("PASSOU")
    else:
        print("NAO PASSOU")
