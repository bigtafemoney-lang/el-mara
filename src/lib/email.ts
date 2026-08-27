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

  const result =
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Vérifie ton compte EL MARA",
      html: `
        <html>
          <body style="
            margin:0;
            padding:40px;
            background:#080808;
            color:#f4f0e8;
            font-family:Arial,Helvetica,sans-serif;
            text-align:center;
          ">
            <div style="
              max-width:600px;
              margin:auto;
            ">

              <div style="
                color:#c7a96b;
                font-size:12px;
                letter-spacing:5px;
                text-transform:uppercase;
              ">
                EL MARA
              </div>

              <h1 style="
                margin-top:35px;
                font-size:36px;
                font-weight:300;
              ">
                Vérifie ton email
              </h1>

              <p style="
                margin:25px auto;
                max-width:430px;
                color:rgba(244,240,232,.55);
                font-size:15px;
                line-height:1.8;
              ">
                Merci d'avoir créé ton compte EL MARA.
                Clique sur le bouton ci-dessous pour
                confirmer ton adresse email.
              </p>

              <a
                href="${url}"
                style="
                  display:inline-block;
                  margin-top:20px;
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

              <p style="
                margin-top:40px;
                color:rgba(244,240,232,.25);
                font-size:11px;
              ">
                Si tu n'es pas à l'origine de cette demande,
                ignore simplement cet email.
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