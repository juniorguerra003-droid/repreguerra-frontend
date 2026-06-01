import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Políticas de Envío',
  description: 'Políticas de envío y entrega de Representaciones Guerra S.A.C.',
};

export default function PoliticasEnvioPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Políticas de Envío y Entregas</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>
            En <strong>Representaciones Guerra S.A.C.</strong> nos comprometemos a entregar tus productos de tecnología y seguridad en el menor tiempo posible, manteniendo la integridad de los equipos.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">1. Zonas de Cobertura</h3>
          <p>
            Realizamos envíos a nivel nacional en todo el territorio de la República del Perú. Trabajamos con agencias logísticas reconocidas (Shalom, Marvisur, Olva Courier, entre otras) para garantizar que tu pedido llegue a su destino.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">2. Tiempos de Despacho</h3>
          <p>
            Los pedidos son procesados y despachados en un plazo de <strong>24 a 48 horas hábiles</strong> luego de haber confirmado el pago. Una vez que el pedido es entregado a la agencia de transporte, el tiempo de llegada a destino dependerá exclusivamente de la empresa logística seleccionada, variando generalmente entre 1 a 5 días hábiles dependiendo de la provincia.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">3. Costos de Envío</h3>
          <p>
            El costo de envío es <strong>"Pago en Destino"</strong> (modalidad flete pago a destino) en la mayoría de los casos para envíos a provincia. Es decir, el cliente paga el costo del flete directamente a la agencia de transportes al recoger su mercadería. Para envíos dentro de Lima Metropolitana, el costo será coordinado al momento de confirmar el pedido y podrá ser sumado a la factura total.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">4. Rastreo de Pedidos</h3>
          <p>
            Una vez que el producto ha sido dejado en la agencia de encomiendas, actualizaremos el estado de tu pedido a "Enviado" en la sección de "Mis Pedidos" y nos pondremos en contacto contigo vía correo electrónico o WhatsApp para proporcionarte la guía de remisión o clave de recojo.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">5. Recepción Conforme</h3>
          <p>
            Es responsabilidad del cliente o de la persona autorizada para recibir el paquete, revisar el buen estado del empaque antes de firmar la conformidad con la agencia de transporte. Si nota alteraciones o daños en la caja, no la reciba y contáctese inmediatamente con nosotros.
          </p>

          <p className="mt-8 text-sm text-gray-400 italic">Última actualización: Noviembre 2026</p>
        </div>
      </div>
    </div>
  );
}
