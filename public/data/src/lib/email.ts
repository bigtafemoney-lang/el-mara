import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error(
      "EMAIL_FROM is not configured."
    );
  }

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Vérifie ton compte EL MARA",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>EL MARA — Vérification</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#080808;
            color:#f4f0e8;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <div
            style="
              max-width:600px;
              margin:0 auto;
              padding:60px 30px;
              text-align:center;
              background:#080808;
            "
          >
            <p
              style="
                margin:0;
                color:#c7a96b;
                font-size:11px;
                letter-spacing:5px;
                text-transform:uppercase;
              "
            >
              EL MARA
            </p>

            <h1
              style="
                margin:35px 0 15px;
                font-size:38px;
                font-weight:300;
                color:#f4f0e8;
              "
            >
              Vérifie ton email
            </h1>

            <p
              style="
                margin:0 auto;
                max-width:420px;
                color:rgba(244,240,232,.55);
                font-size:15px;
                line-height:1.8;
              "
            >
              Merci d’avoir créé ton compte EL MARA.
              Clique sur le bouton ci-dessous pour confirmer
              ton adresse email.
            </p>

            <div style="margin:40px 0;">
              <a
                href="${url}"
                style="
                  display:inline-block;
                  padding:16px 30px;
                  background:#c7a96b;
                  color:#080808;
                  text-decoration:none;
                  font-size:11px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                "
              >
                Vérifier mon email
              </a>
            </div>

            <p
              style="
                margin:30px auto 0;
                max-width:430px;
                color:rgba(244,240,232,.3);
                font-size:12px;
                line-height:1.7;
              "
            >
              Si tu n’es pas à l’origine de cette demande,
              tu peux ignorer cet email.
            </p>

            <p
              style="
                margin-top:50px;
                color:rgba(244,240,232,.2);
                font-size:10px;
                letter-spacing:2px;
              "
            >
              EL MARA — ALL RIGHTS RESERVED
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (result.error) {
    throw new Error(
      result.error.message
    );
  }

  return result.data;
}