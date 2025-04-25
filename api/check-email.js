export default async function handler(req, res) {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: "E-mail não fornecido" });
    }

    const apiKey = process.env.HIBP_API_KEY;
    const hibpUrl = `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`;

    try {
        const response = await fetch(hibpUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Vercel-App',
                'hibp-api-key': apiKey
            }
        });

        if (response.status === 200) {
            const breaches = await response.json();
            return res.status(200).json({
                message: `Este e-mail foi encontrado em ${breaches.length} vazamentos.`,
                breaches: breaches
            });
        } else if (response.status === 404) {
            return res.status(200).json({ message: "Este e-mail não foi comprometido." });
        } else {
            return res.status(500).json({ error: "Erro ao acessar a API do Have I Been Pwned." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Erro interno ao verificar o e-mail." });
    }
}
