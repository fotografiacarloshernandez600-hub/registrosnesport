export default async function AdminLogin({ searchParams }: { searchParams: Promise<{error?:string}> }) {
  const { error } = await searchParams;
  return <main className="login-page"><form action="/api/admin/login" method="post" className="login-card"><a href="/" className="logo-brand"><img src="/nesport-logo.png" alt="Nesport" /></a><span>PORTAL DE ADMINISTRACIÓN</span><h1>Acceso Nesport</h1><p>Ingresa la contraseña administrativa para gestionar carreras y participantes.</p><label>Contraseña<input name="password" type="password" required autoComplete="current-password" /></label>{error&&<small className="login-error">Contraseña incorrecta.</small>}<button className="btn primary">Entrar al dashboard</button><a href="/">Volver al inicio</a></form></main>;
}
