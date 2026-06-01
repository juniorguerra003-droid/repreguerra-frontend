import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Políticas de Privacidad',
  description: 'Políticas de privacidad y protección de datos personales de Representaciones Guerra S.A.C.',
};

export default function PoliticasPrivacidadPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Políticas de Privacidad</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>
            En <strong>Representaciones Guerra S.A.C.</strong> (en adelante, "la Empresa"), respetamos y protegemos la privacidad de nuestros usuarios. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web, en cumplimiento con la Ley de Protección de Datos Personales (Ley N° 29733) del Perú.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">1. Recopilación de Información</h3>
          <p>
            Recopilamos información personal que nos proporcionas voluntariamente al registrarte en el sitio web, realizar compras, suscribirte a boletines o contactarnos. Esta información incluye, pero no se limita a: Nombres y apellidos, Documento de Identidad (DNI/RUC), correo electrónico, número de teléfono y dirección física de entrega.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">2. Uso de la Información</h3>
          <p>
            La información recopilada será utilizada exclusivamente para los siguientes propósitos:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Procesar, preparar y entregar los pedidos realizados en nuestra tienda virtual.</li>
            <li>Enviarte notificaciones importantes sobre el estado de tu compra (confirmaciones, guías de envío).</li>
            <li>Atender tus consultas a través del Libro de Reclamaciones o canales de soporte.</li>
            <li>Enviarte información comercial o promocional (solo si nos has dado tu consentimiento explícito).</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">3. Protección y Almacenamiento</h3>
          <p>
            Hemos implementado medidas de seguridad administrativas, técnicas y físicas para proteger tu información personal contra pérdida, robo, uso indebido, acceso no autorizado, divulgación, alteración y destrucción. Los datos son almacenados en bases de datos seguras y encriptadas.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">4. Compartir Información con Terceros</h3>
          <p>
            No vendemos, alquilamos ni comercializamos tu información personal con terceros. Únicamente compartimos los datos estrictamente necesarios con las agencias logísticas (ej. Shalom, Olva) para poder cumplir con el envío de tus productos.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">5. Derechos ARCO</h3>
          <p>
            Como titular de los datos personales, tienes el derecho de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO). Si deseas ejercer alguno de estos derechos sobre la información que mantenemos de ti, puedes enviarnos un correo electrónico a <strong>ventas@repreguerra.com</strong> o utilizar los canales de contacto de nuestro sitio web.
          </p>

          <p className="mt-8 text-sm text-gray-400 italic">Última actualización: Noviembre 2026</p>
        </div>
      </div>
    </div>
  );
}
