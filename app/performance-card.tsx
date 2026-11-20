import { Activity, Dumbbell } from 'lucide-react';

export default function PerformanceCard() {
  return (
    <section className="performance-card" aria-labelledby="performance-title">
      <div className="performance-symbol" aria-hidden="true"><Dumbbell size={36} /></div>
      <div className="performance-copy">
        <span className="club-eyebrow">HUNDRA PERFORMANCE</span>
        <h2 id="performance-title">Tu siguiente nivel<br />empieza con un plan.</h2>
        <p>¿Aún no has activado HUNDRA Performance? Rellena el formulario para empezar con tu planning físico.</p>
        <p>Si ya lo tienes activo y toca volver a medir, rellénalo también para actualizar tu planning.</p>
      </div>
      <a className="performance-button" href="https://usagency.typeform.com/testfisico" target="_blank" rel="noopener noreferrer">
        <Activity size={21} aria-hidden="true" /><span>Mi planning físico<small>Activar o actualizar</small></span>
      </a>
    </section>
  );
}
