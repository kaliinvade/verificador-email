document.addEventListener('DOMContentLoaded', function() {
    // Formulário de email
    const emailForm = document.getElementById('emailForm');
    const emailResults = document.getElementById('emailResults');
    
    // Formulário de senha
    const passwordForm = document.getElementById('passwordForm');
    const passwordResults = document.getElementById('passwordResults');
    
    // Configuração da API
    const API_ENDPOINT = 'https://haveibeenpwned.com/api/v3';
    const API_KEY = '1b75f66bf3474e97830c0a3bc16d3643'; // Substitua pela sua chave de API
    
    // Verificar email
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value.trim();
        
        if (!email) return;
        
        emailResults.innerHTML = '<p>Verificando...</p>';
        
        try {
            const response = await fetch(`${API_ENDPOINT}/breachedaccount/${encodeURIComponent(email)}`, {
                headers: {
                    'hibp-api-key': API_KEY,
                    'user-agent': 'Beeahead Security Check'
                }
            });
            
            if (response.status === 404) {
                emailResults.innerHTML = `
                    <div class="breach-card" style="border-left-color: var(--success-color)">
                        <h4>Nenhum vazamento encontrado!</h4>
                        <p>Seu email <strong>${email}</strong> não foi encontrado em nossos registros de vazamentos conhecidos.</p>
                    </div>
                `;
                return;
            }
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            const breaches = await response.json();
            displayEmailResults(email, breaches);
            
        } catch (error) {
            console.error('Erro:', error);
            emailResults.innerHTML = `
                <div class="breach-card" style="border-left-color: var(--danger-color)">
                    <h4>Erro na verificação</h4>
                    <p>Ocorreu um erro ao verificar seu email. Por favor, tente novamente mais tarde.</p>
                    <p class="breach-meta">${error.message}</p>
                </div>
            `;
        }
    });
    
    // Verificar senha
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value.trim();
        
        if (!password) return;
        
        passwordResults.innerHTML = '<p>Verificando...</p>';
        
        try {
            // Hash SHA-1 da senha
            const hash = await sha1(password);
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5).toUpperCase();
            
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            const results = await response.text();
            const found = results.split('\n').some(line => {
                const [hashSuffix, count] = line.split(':');
                return hashSuffix === suffix;
            });
            
            displayPasswordResults(found);
            
        } catch (error) {
            console.error('Erro:', error);
            passwordResults.innerHTML = `
                <div class="breach-card" style="border-left-color: var(--danger-color)">
                    <h4>Erro na verificação</h4>
                    <p>Ocorreu um erro ao verificar sua senha. Por favor, tente novamente mais tarde.</p>
                    <p class="breach-meta">${error.message}</p>
                </div>
            `;
        }
    });
    
    // Função para exibir resultados de email
    function displayEmailResults(email, breaches) {
        if (!breaches || breaches.length === 0) {
            emailResults.innerHTML = `
                <div class="breach-card" style="border-left-color: var(--success-color)">
                    <h4>Nenhum vazamento encontrado!</h4>
                    <p>Seu email <strong>${email}</strong> não foi encontrado em nossos registros de vazamentos conhecidos.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="breach-card" style="border-left-color: var(--warning-color)">
                <h4>Atenção!</h4>
                <p>Seu email <strong>${email}</strong> foi encontrado em <strong>${breaches.length}</strong> vazamentos de dados.</p>
            </div>
        `;
        
        breaches.forEach(breach => {
            const breachDate = new Date(breach.BreachDate).toLocaleDateString();
            const addedDate = new Date(breach.AddedDate).toLocaleDateString();
            
            html += `
                <div class="breach-card">
                    <h4>${breach.Title}</h4>
                    <div class="breach-meta">
                        <span>Data do vazamento: ${breachDate}</span>
                        <span>Adicionado em: ${addedDate}</span>
                    </div>
                    <p>${breach.Description}</p>
                    <p class="breach-meta">Dados comprometidos: ${breach.DataClasses.join(', ')}</p>
                    <a href="https://haveibeenpwned.com/breach/${breach.Name}" target="_blank" rel="noopener">Mais informações</a>
                </div>
            `;
        });
        
        // Adicionar recomendações
        html += `
            <div class="breach-card" style="border-left-color: var(--accent-color)">
                <h4>Recomendações de segurança</h4>
                <ol>
                    <li>Altere imediatamente a senha deste email e de qualquer conta que use a mesma senha.</li>
                    <li>Ative a autenticação de dois fatores em todas as contas importantes.</li>
                    <li>Considere usar um gerenciador de senhas para criar e armazenar senhas únicas e fortes.</li>
                    <li>Fique atento a e-mails de phishing que possam se aproveitar desses vazamentos.</li>
                </ol>
            </div>
        `;
        
        emailResults.innerHTML = html;
    }
    
    // Função para exibir resultados de senha
    function displayPasswordResults
