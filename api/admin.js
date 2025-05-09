export default function handler(req, res) {

    const accountId = process.env.R2_ACCOUNT_ID;

    const bucket = process.env.R2_BUCKET;

    if (!accountId || !bucket) {

        res.status(500).send('Missing R2 variables');

        return;

    }

    const targetUrl = `https://dash.cloudflare.com/${accountId}` + `/r2/default/buckets/${bucket}`;

    res.setHeader('Content-Type', 'text/html');

    res.send(`

        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Admin dashboard">
            <title>Admin</title>
        </head>
        <body>
            <script>
                window.open("${targetUrl}");
            </script>
        </body>
        </html>

    `);

}