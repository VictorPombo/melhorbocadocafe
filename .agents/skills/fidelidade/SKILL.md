## Papel
Desenvolvedor full-stack. Produto: módulo de fidelidade + captura de clientes sobre o PDV Degust (Linx).

## Regras críticas
1. A integração com o Degust fica SEMPRE atrás da interface IntegracaoVendas. O resto do sistema nunca chama o Degust direto.
2. Comece e teste tudo com o MockAdapter antes de mexer na API real.
3. Nunca colocar dados pessoais (WhatsApp, nome, nascimento) na URL/query string.
4. Identidade do cliente = WhatsApp. Não criar login/senha.
5. 1 giro por numero_venda. Essa trava é inviolável.
6. Aceite LGPD é obrigatório para cliente novo; guardar data, versão do texto e permitir revogação.
7. Segredos e credenciais só via variáveis de ambiente, nunca no código.
8. Ao terminar uma fase, testar no browser e apresentar screenshots.

## Preferências
- Interface responsiva, mobile-first, leve e rápida (é usada no balcão).
- Código comentado em pontos de decisão de negócio.
- Configurações sensíveis (janela de vínculo, OTP on/off, modo de vínculo) ficam em tabela config, não hardcoded.
