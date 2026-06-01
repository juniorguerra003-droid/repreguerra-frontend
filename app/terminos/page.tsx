import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de la plataforma Representaciones Guerra S.A.C.',
};

export default function TerminosPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Términos y Condiciones</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>
            Bienvenido a <strong>Representaciones Guerra S.A.C.</strong> Al acceder y utilizar nuestro sitio web, aceptas cumplir con los siguientes términos y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, por favor no utilices nuestro sitio web.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">1. Uso del Sitio Web</h3>
          <p>
            El contenido de las páginas de este sitio web es para tu información y uso general únicamente. Está sujeto a cambios sin previo aviso. Ni nosotros ni terceros ofrecemos ninguna garantía en cuanto a la exactitud, puntualidad, rendimiento, integridad o idoneidad de la información y los materiales encontrados o ofrecidos en este sitio web para cualquier propósito particular.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">2. Compras y Pagos</h3>
          <p>
            Al realizar una compra, te comprometes a proporcionar información actual, completa y precisa para todas las compras realizadas en nuestra tienda. Nos reservamos el derecho de rechazar cualquier pedido que realices con nosotros. En caso de pago por transferencia bancaria (Yape/Plin), el pedido será procesado únicamente tras la confirmación visual y bancaria del abono.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">3. Precios e Inventario</h3>
          <p>
            Los precios de nuestros productos están sujetos a cambios sin previo aviso. Nos reservamos el derecho en cualquier momento de modificar o discontinuar el Servicio (o cualquier parte o contenido del mismo) sin previo aviso. Las ofertas mostradas están sujetas a disponibilidad de stock.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">4. Propiedad Intelectual</h3>
          <p>
            Este sitio web contiene material que es de nuestra propiedad o está bajo nuestra licencia. Este material incluye, pero no se limita a, el diseño, la disposición, el aspecto, la apariencia y los gráficos. Queda prohibida la reproducción salvo de conformidad con el aviso de copyright, que forma parte de estos términos y condiciones. Todas las marcas reproducidas en este sitio web que no son propiedad del operador ni están licenciadas a este, son reconocidas en el sitio web (Ej. Hikvision, Dahua).
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">5. Enlaces a Terceros</h3>
          <p>
            De vez en cuando, este sitio web también puede incluir enlaces a otros sitios web. Estos enlaces se proporcionan para tu conveniencia con el fin de proporcionar más información. No significan que respaldamos el/los sitio(s) web. No tenemos ninguna responsabilidad por el contenido del/de los sitio(s) web enlazado(s).
          </p>

          <p className="mt-8 text-sm text-gray-400 italic">Última actualización: Noviembre 2026</p>
        </div>
      </div>
    </div>
  );
}
