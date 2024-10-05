import Document, { Html, Head, Main, NextScript } from 'next/document'
class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html lang="en" className='dark' data-mode="dark">
                <Head>
                    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" as="style" />
                    <link href="images/logos/favicon.svg" rel="shortcut icon" type="image/x-icon" />
                    <link rel="icon" href="images/logos/favicon.svg" />
                    <link rel="apple-touch-icon" href="images/logos/favicon.svg" />
                    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet"></link>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument