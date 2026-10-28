// Carta de Casa Olivo, transcrita desde casaolivorestaurante.cl/carta.
// Precios en pesos chilenos. `nota` es la porción o una aclaración corta.

export type Plato = {
  nombre: string;
  precio: number | number[];
  desc?: string;
  nota?: string | string[];
  tags?: ('vegano' | 'sin gluten' | 'para compartir')[];
};

export type Categoria = {
  id: string;
  titulo: string;
  bajada?: string;
  layout?: 'lista' | 'compacta' | 'dos-columnas';
  /** Encabezados de columnas de precio, por ejemplo Botella / Copa */
  columnas?: string[];
  grupos?: { titulo?: string; bajada?: string; platos: Plato[] }[];
};

export type Seccion = {
  id: 'cocina' | 'bar';
  titulo: string;
  categorias: Categoria[];
};

export const cocina: Seccion = {
  id: 'cocina',
  titulo: 'Cocina',
  categorias: [
    {
      id: 'entrantes',
      titulo: 'Entrantes',
      bajada: 'Para compartir',
      grupos: [
        {
          platos: [
            { nombre: 'Machas a la parmesana', precio: 10990, nota: '6 uds.', desc: 'Lenguas de macha gratinadas al horno con vino blanco, crema y queso parmesano.' },
            { nombre: 'Ostiones parmesanos', precio: 10990, nota: '6 uds.', desc: 'Ostiones ecuatorianos salteados en mantequilla, cremados con queso parmesano.' },
            { nombre: 'Pinchos al chimichurri', precio: 11990, nota: '3 uds.', desc: 'Pinchos de lomo de res, longaniza artesanal, cebolla morada y pimentón, adobados en chimichurri ahumado.' },
            { nombre: 'Mix de empanaditas', precio: [6990, 12990], nota: ['3 uds.', '6 uds.'], desc: 'Empanaditas de horno rellenas de pino o queso.' },
            { nombre: 'Papas fritas', precio: 9990, nota: '600 g', desc: 'Para compartir.', tags: ['para compartir'] },
            { nombre: 'Quesadilla de pollo', precio: 9990, desc: 'Tortilla mexicana con queso mantecoso, trocitos de pollo, choclo y ciboulette, con guacamole y sour cream.' },
            { nombre: 'Quesadilla de res', precio: 11990, desc: 'Tortilla mexicana rellena de queso mantecoso, carne mechada y pimentón, con guacamole y sour cream.' },
            { nombre: 'Quesadilla mixta', precio: 11990, desc: 'Mix de quesadillas de pollo y res.' },
            { nombre: 'Quesadilla veggie', precio: 8990, desc: 'Tortilla mexicana rellena de queso mantecoso, champiñón, choclo y cebolla caramelizada, con guacamole y sour cream.' },
            { nombre: 'Consomé de ave', precio: 6690, desc: 'Clásica sopa a base de caldo de pollo, vegetales, huevo y cilantro.' },
            { nombre: 'Ceviche de reineta', precio: 14990, desc: 'Cubos de reineta marinados en limón, con cebolla morada, cilantro y notas cítricas. Dressing de leche de tigre.' },
            { nombre: 'Ceviche de salmón', precio: 14990, desc: 'Cubos de salmón marinados en limón, con cebolla morada, cilantro y notas cítricas. Dressing de leche de tigre.' },
            { nombre: 'Ceviche mixto', precio: 16990, desc: 'Salmón, reineta y camarones marinados en limón, con cebolla morada, cilantro y notas cítricas. Dressing de leche de tigre.' },
            { nombre: 'Crudo de res', precio: 14990, desc: 'Carne de res cruda finamente picada con cebolla, ají verde, perejil, pepinillos y salsa de mayonesa y yogurt.' },
            { nombre: 'Camarones apanados', precio: 9990, nota: '6 uds.', desc: 'Crujientes por fuera y jugosos por dentro.' },
            { nombre: 'Carpaccio de salmón', precio: 14990, desc: 'Finas láminas de salmón con limoneta fresca, fetas de queso parmesano y alcaparras.' },
          ],
        },
      ],
    },
    {
      id: 'tablas',
      titulo: 'Tablas',
      bajada: 'Para la mesa completa',
      grupos: [
        {
          platos: [
            { nombre: 'Tabla Santa Julia', nota: '3 a 4 personas', precio: 29990, desc: 'Carne de res al vino tinto con champiñones, pollo estilo oriental con vegetales, ceviche mixto, camarones apanados, tostadas y salsas.' },
            { nombre: 'Chorrillana Casa Olivo', nota: '3 a 4 personas', precio: 24990, desc: 'Papas fritas, churrasco de vacuno, longaniza, cebolla caramelizada y huevo frito.' },
            { nombre: 'Tabla a lo pobre', nota: '2 personas', precio: 23990, desc: 'Papas fritas, churrasco, cebolla caramelizada y huevo frito.' },
            { nombre: 'Tabla Fresia', nota: '2 personas', precio: 20990, desc: 'Carne de res al vino tinto salteada con champiñón y cebolla morada sobre papas fritas.' },
          ],
        },
      ],
    },
    {
      id: 'autor',
      titulo: 'De autor',
      bajada: 'La cocina de la casa',
      grupos: [
        {
          platos: [
            { nombre: 'Filete Olivar', precio: 17990, desc: 'Medallón de filete sellado en su punto sobre gratín de papas, verduras y chancho en piedra.' },
            { nombre: 'Plateada de res', precio: 16990, desc: 'Plateada en cocción lenta en reducción de carne, sobre pastelera de choclo y tomate confitado, con aceite de albahaca.' },
            { nombre: 'Osobuco con cremoso de mote', precio: 16990, desc: 'Osobuco en cocción lenta sobre cremoso de mote.' },
            { nombre: 'Entraña al punto', precio: 17990, desc: 'Entraña sellada sobre papas rústicas, champiñones salteados y salsa de yogurt al ciboulette.' },
            { nombre: 'Merluza austral', precio: 15990, desc: 'A la plancha, con mix de mariscos salteados al ajillo sobre cremoso de quinoa.' },
            { nombre: 'Pulpo Olivar', precio: 17990, desc: 'Pulpo grillado con papas rústicas en caldo de pulpo.' },
            { nombre: 'Lomo Casa Olivo', precio: 17990, desc: 'Lomo vetado con arroz árabe y mantequilla café de París.' },
            { nombre: 'Lomo saltado', precio: 17990, desc: 'Clásico peruano con lomo liso en cubos, cebolla morada y tomate con soya, arroz blanco y papas fritas.' },
            { nombre: 'Ceviche de champiñón', precio: 10990, desc: 'Láminas de champiñón de París marinadas en limón, con cebolla morada, cilantro y notas cítricas. Dressing de leche de tigre.', tags: ['vegano', 'sin gluten'] },
          ],
        },
      ],
    },
    {
      id: 'tradiciones',
      titulo: 'Tradiciones chilenas',
      bajada: 'Recetas de casa',
      grupos: [
        {
          platos: [
            { nombre: 'Pastel de choclo', precio: 13990, desc: 'Pastelera de choclo con albahaca, pino de carne, pechuga de pollo, aceitunas y huevo.' },
            { nombre: 'Caldillo de congrio', precio: 14990, desc: 'Caldo de pescado, crema, congrio fresco, ají cristal y cilantro.' },
            { nombre: 'Chupe de jaiba', precio: 14990, desc: 'Jaiba desmenuzada cremada con leche, pan y verduras, gratinada con parmesano.' },
            { nombre: 'Cazuela de vacuno', precio: 13990, desc: 'Caldo de vacuno con asado de tira, papas cocidas, zapallo, arroz y vegetales.' },
            { nombre: 'Costillar de cerdo', precio: 15990, desc: 'Costillar de cerdo ahumado sobre puré picante o puré.' },
            { nombre: 'Merluza frita', precio: 14990, desc: 'Sobre puré de papas y verduras salteadas.' },
            { nombre: 'Lomo a lo pobre', precio: 17990, desc: 'Lomo vetado con papas fritas, cebolla caramelizada y huevo frito.' },
          ],
        },
      ],
    },
    {
      id: 'pastas',
      titulo: 'Pastas, risottos y ensaladas',
      grupos: [
        {
          platos: [
            { nombre: 'Fetuccini', precio: 13990, desc: 'Con salsa pesto o bolognesa.' },
            { nombre: 'Risotto de mariscos', precio: 16990, desc: 'Arroz arbóreo en fumet de pescado con camarones, choros y anillos de calamar salteados en oliva al ajo, cremado en parmesano.' },
            { nombre: 'Ensalada César', precio: 12990, desc: 'Lechuga fresca con crutones artesanales, queso parmesano y sour cream.' },
          ],
        },
      ],
    },
    {
      id: 'carnes',
      titulo: 'Carnes y pescados',
      bajada: 'Elige tu proteína y súmale un agregado',
      layout: 'compacta',
      grupos: [
        {
          platos: [
            { nombre: 'Lomo vetado de vacuno', precio: 14990 },
            { nombre: 'Plateada de res', precio: 14990 },
            { nombre: 'Filete de vacuno', precio: 14990 },
            { nombre: 'Entraña de vacuno', precio: 14990 },
            { nombre: 'Pechuga de pollo a la plancha', precio: 11990 },
            { nombre: 'Salmón a la plancha', precio: 14990 },
            { nombre: 'Reineta', nota: 'frita o a la plancha', precio: 14990 },
            { nombre: 'Merluza austral', nota: 'frita o a la plancha', precio: 12990 },
            { nombre: 'Congrio', nota: 'frito o a la plancha', precio: 12990 },
          ],
        },
      ],
    },
    {
      id: 'agregados',
      titulo: 'Agregados',
      layout: 'dos-columnas',
      grupos: [
        {
          platos: [
            { nombre: 'Ensalada a la chilena', precio: 3990, desc: 'Tomate en rodajas, cebolla en pluma, vinagre y cilantro.' },
            { nombre: 'Ensalada verde', precio: 4290, desc: 'Palta laminada, lechuga hidropónica, brócoli y palmitos.' },
            { nombre: 'Arroz', precio: 3990, desc: 'Arroz blanco.' },
            { nombre: 'Papas mayo', precio: 3990, desc: 'Papas cocidas, mayonesa, cilantro y limón.' },
            { nombre: 'Puré de papas', precio: 4990, desc: 'Papa prensada con mantequilla y crema, con merkén o cilantro.' },
            { nombre: 'Papas fritas', precio: 4990, nota: '300 g' },
            { nombre: 'Papas a la crema', precio: 5990, desc: 'Doble cocción, cremadas y perfumadas con queso y ciboulette.' },
            { nombre: 'Pastelera de choclo', precio: 5990, desc: 'Choclo cremoso, de textura suave y dulzor natural.' },
            { nombre: 'Palta y palmito', precio: 5990, desc: 'La suavidad de la palta con el toque crujiente del palmito.' },
            { nombre: 'A lo pobre', precio: 6990, desc: 'Papas fritas, cebolla dorada y huevo frito.' },
          ],
        },
      ],
    },
    {
      id: 'sandwich',
      titulo: 'Sándwich',
      bajada: 'Elige la proteína y el acompañamiento que quieras',
      layout: 'compacta',
      grupos: [
        {
          titulo: 'Proteína',
          platos: [
            { nombre: 'Hamburguesa', precio: 10990 },
            { nombre: 'Carne mechada', precio: 10990 },
            { nombre: 'Churrasco de res', precio: 10990 },
            { nombre: 'Pollo', precio: 9990 },
          ],
        },
        {
          titulo: 'Acompañamiento',
          platos: [
            { nombre: 'Olivo', precio: 0, desc: 'Queso mantecoso fundido, pluma de cebolla caramelizada y tocino crocante en pan frica.' },
            { nombre: 'Italiano', precio: 0, desc: 'Palta, tomate fresco y mayonesa.' },
            { nombre: 'Luco', precio: 0, desc: 'Queso fundido.' },
            { nombre: 'A lo pobre', precio: 0, desc: 'Cebolla caramelizada, huevo frito y papas fritas.' },
          ],
        },
      ],
    },
    {
      id: 'ninos',
      titulo: 'Menú niños',
      bajada: 'Hasta 12 años',
      grupos: [
        {
          platos: [
            { nombre: 'Pechuga de pollo', precio: 7990, desc: 'Con papas fritas, puré, arroz o ensalada verde.' },
            { nombre: 'Nuggets', nota: 'pollo o vegetariano', precio: 7990, desc: 'Con papas fritas, puré, arroz o ensalada verde.' },
          ],
        },
      ],
    },
    {
      id: 'postres',
      titulo: 'Postres',
      layout: 'compacta',
      grupos: [
        {
          platos: [
            { nombre: 'Kuchen de manzana con helado', precio: 5990 },
            { nombre: 'Leche nevada', precio: 5990 },
            { nombre: 'Torta pompadour', precio: 5990 },
            { nombre: 'Leche asada', precio: 5990 },
            { nombre: 'Panqueque celestino', precio: 5990 },
            { nombre: 'Ensalada de frutas', precio: 5990 },
            { nombre: 'Volcán de chocolate', precio: 6990 },
            { nombre: 'Bocado de helado', precio: 4990 },
          ],
        },
      ],
    },
  ],
};

export const happyHour = {
  dias: 'Miércoles a sábado',
  horas: '18:00 a 21:00',
  nota: 'No aplica en días de espectáculos.',
  tragos: [
    { nombre: 'Pisco sour', precio: 6500 },
    { nombre: 'Pisco sour catedral', precio: 13000 },
    { nombre: 'Chardonnay sour', precio: 8300 },
    { nombre: 'Carmenere sour', precio: 7000 },
    { nombre: 'Carmenere sour catedral', precio: 13500 },
    { nombre: 'Manzana sour', precio: 10000 },
    { nombre: 'Manzana sour catedral', precio: 13500 },
    { nombre: 'Copa espumante', precio: 7000 },
    { nombre: 'Mojito cubano', precio: 11000 },
    { nombre: 'Aperol', precio: 11500 },
    { nombre: 'Ramazzotti', precio: 11500 },
    { nombre: 'Tropical gin', precio: 13000 },
    { nombre: 'Sangría', precio: 10500 },
    { nombre: 'Piscola', precio: 9500 },
    { nombre: 'Whisky cola', precio: 10000 },
    { nombre: 'Piña colada', precio: 10000 },
    { nombre: 'Vodka berries', precio: 10000 },
    { nombre: 'Tequila margarita', precio: 11000 },
  ],
};

const sabores = 'Mango, frambuesa, frutilla o maracuyá.';

export const bar: Seccion = {
  id: 'bar',
  titulo: 'Oli bar',
  categorias: [
    {
      id: 'aperitivos',
      titulo: 'Aperitivos',
      layout: 'dos-columnas',
      grupos: [
        {
          platos: [
            { nombre: 'Pisco sour', precio: 5000 },
            { nombre: 'Pisco sour catedral', precio: 8500 },
            { nombre: 'Pisco sour sabores', precio: 5500, desc: sabores },
            { nombre: 'Manzana sour', precio: 6500 },
            { nombre: 'Manzana sour catedral', precio: 9500 },
            { nombre: 'Chardonnay sour', precio: 5500 },
            { nombre: 'Chardonnay sour catedral', precio: 9000 },
            { nombre: 'Carmenere sour', precio: 5500 },
            { nombre: 'Carmenere sour catedral', precio: 9000 },
            { nombre: 'Whisky sour', precio: 7000 },
            { nombre: 'Vaina tradicional', precio: 6500 },
            { nombre: 'Martini dry', precio: 6500 },
            { nombre: 'Copa espumante', precio: 5500 },
            { nombre: 'Kir royal', precio: 5500 },
            { nombre: 'Ramazzotti', precio: 7200 },
            { nombre: 'Aperol spritz', precio: 7200 },
            { nombre: 'Hugo spritz', precio: 8500 },
            { nombre: 'Clavo oxidado', precio: 8500 },
            { nombre: 'Mojito sabores', precio: 7500, desc: 'Con o sin alcohol. Ron, limón sutil, menta, agua con gas y hielo molido. ' + sabores },
            { nombre: 'Tropical gin', precio: 8500, desc: sabores },
            { nombre: 'Tequila margarita', precio: 7500 },
            { nombre: 'Caipiriña y caipiroska', precio: 7500, desc: sabores },
            { nombre: 'Gin tonic', precio: 7500 },
            { nombre: 'Moscow mule', precio: 8500 },
            { nombre: 'Apple mule', precio: 8500 },
            { nombre: 'Sangría tinto', precio: 6500 },
            { nombre: 'Negroni', precio: 7500 },
            { nombre: 'Tom collins', precio: 7000 },
            { nombre: 'Vodka berries', precio: 6500 },
            { nombre: 'Piña colada', precio: 6500 },
          ],
        },
      ],
    },
    {
      id: 'cervezas',
      titulo: 'Cervezas',
      bajada: 'En botella',
      layout: 'compacta',
      grupos: [
        {
          platos: [
            { nombre: 'Kunstmann Lager', nota: '4,3° · 330 cc', precio: 4500 },
            { nombre: 'Kunstmann Torobayo', nota: '5,0° · 500 cc', precio: 6000 },
            { nombre: 'Kunstmann Torobayo', nota: '5,0° · 330 cc', precio: 4500 },
            { nombre: 'Kunstmann Miel', nota: '4,8° · 330 cc', precio: 4500 },
            { nombre: 'Austral Calafate', nota: '5,0° · 500 cc', precio: 6000 },
            { nombre: 'Austral Calafate', nota: '5,0° · 330 cc', precio: 4500 },
            { nombre: 'Austral Lager', nota: '4,6° · 330 cc', precio: 4500 },
            { nombre: 'Kunstmann Lager sin alcohol', nota: '330 cc', precio: 4500 },
            { nombre: 'Heineken', nota: '5,0° · 350 cc', precio: 4500 },
            { nombre: 'Heineken 0,0', nota: '350 cc', precio: 4300 },
            { nombre: 'Corona', nota: '4,5° · 330 cc', precio: 4500 },
            { nombre: 'Royal Guard', nota: '5,0° · 350 cc', precio: 4000 },
            { nombre: 'Sol', nota: '4,5° · 350 cc', precio: 4000 },
            { nombre: 'Michelada', nota: 'Tabasco o merkén, limón y sal', precio: 2000 },
            { nombre: 'Chelada', nota: 'Sal y limón', precio: 1500 },
          ],
        },
      ],
    },
    {
      id: 'sin-alcohol',
      titulo: 'Jugos, limonadas y bebidas',
      layout: 'dos-columnas',
      grupos: [
        {
          platos: [
            { nombre: 'Jugo natural', precio: 5500, desc: 'Frambuesa, piña, frutilla o mango.' },
            { nombre: 'Limonada tradicional', precio: 5000 },
            { nombre: 'Limonada sabores', precio: 5500, desc: 'Frambuesa, piña, frutilla o mango.' },
            { nombre: 'Limonada menta jengibre', precio: 5500 },
            { nombre: 'Limonada de cedrón', precio: 5500 },
            { nombre: 'Bebidas', precio: 2500, desc: 'Consulta los sabores disponibles.' },
            { nombre: 'Agua mineral', precio: 2500, desc: 'Con o sin gas.' },
            { nombre: 'Red Bull', precio: 3500, desc: 'Normal, light o tropical.' },
          ],
        },
      ],
    },
    {
      id: 'cafe',
      titulo: 'Café e infusiones',
      layout: 'compacta',
      grupos: [
        {
          platos: [
            { nombre: 'Café americano', precio: 3000 },
            { nombre: 'Espresso simple', precio: 3000 },
            { nombre: 'Espresso doble', precio: 3500 },
            { nombre: 'Cortado doble', precio: 3800 },
            { nombre: 'Té o infusiones', precio: 2800 },
            { nombre: 'Café helado', precio: 4900 },
          ],
        },
      ],
    },
    {
      id: 'tragos',
      titulo: 'Tragos largos',
      layout: 'compacta',
      grupos: [
        {
          titulo: 'Pisco',
          bajada: 'Envejecido, reservado, transparente',
          platos: [
            { nombre: 'Alto del Carmen', nota: '35°', precio: 5990 },
            { nombre: 'Alto del Carmen doble destilado', precio: 7500 },
            { nombre: 'Mistral Original', nota: '35°', precio: 6000 },
            { nombre: 'Mistral Apple', nota: '35°', precio: 6500 },
            { nombre: 'Mistral Nobel', nota: '40°', precio: 7500 },
          ],
        },
        {
          titulo: 'Gin',
          platos: [
            { nombre: 'Bombay', nota: '47°', precio: 8500 },
            { nombre: "Hendrick's", nota: '41,4°', precio: 9500 },
            { nombre: 'Tanqueray', nota: '47,3°', precio: 9000 },
          ],
        },
        {
          titulo: 'Whisky',
          platos: [
            { nombre: "Jack Daniel's Apple", nota: '35°', precio: 7500 },
            { nombre: "Jack Daniel's Honey", nota: '35°', precio: 7500 },
            { nombre: "Jack Daniel's N°7", nota: '40°', precio: 7000 },
            { nombre: 'Johnnie Walker Red', nota: '40°', precio: 6500 },
            { nombre: 'Johnnie Walker Black Label 12 años', nota: '40°', precio: 8000 },
            { nombre: 'Chivas Regal 12 años', nota: '40°', precio: 8500 },
          ],
        },
        {
          titulo: 'Ron, vodka y otros',
          platos: [
            { nombre: 'Havanna añejado', nota: 'Ron · 40°', precio: 7500 },
            { nombre: 'Absolut', nota: 'Vodka · 40°', precio: 6500 },
            { nombre: 'Jägermeister', nota: 'Licor de hierbas', precio: 7990 },
            { nombre: 'Fernet Branca', nota: '39°', precio: 5500 },
          ],
        },
        {
          titulo: 'Bajativos',
          platos: [
            { nombre: 'Amaretto', precio: 3000 },
            { nombre: 'Manzanilla', precio: 3000 },
            { nombre: 'Menta frappé', precio: 3000 },
            { nombre: 'Drambuie', precio: 7000 },
          ],
        },
      ],
    },
    {
      id: 'vinos',
      titulo: 'Vinos y espumantes',
      layout: 'compacta',
      columnas: ['Botella', 'Copa'],
      grupos: [
        {
          titulo: 'Cabernet sauvignon',
          platos: [
            { nombre: 'Marqués de Casa Concha Gran Reserva', precio: 32500 },
            { nombre: 'San José de Apalta Gran Reserva', precio: 19900 },
            { nombre: 'Casillero del Diablo Reserva', precio: [12900, 4900] },
            { nombre: 'San José de Apalta Reserva', precio: 11500 },
          ],
        },
        {
          titulo: 'Carmenere',
          platos: [
            { nombre: 'The Wine Gran Reserva', precio: 23900 },
            { nombre: 'San José de Apalta Single Gran Reserva', precio: 18900 },
            { nombre: 'Casillero del Diablo Reserva', precio: 12900 },
            { nombre: 'San José de Apalta Reserva', precio: 11500 },
          ],
        },
        {
          titulo: 'Merlot',
          platos: [
            { nombre: 'Marqués de Casa Concha Gran Reserva', precio: 32500 },
            { nombre: 'San José de Apalta Reserva', precio: 11500 },
          ],
        },
        {
          titulo: 'Syrah, pinot noir y carignan',
          platos: [
            { nombre: 'San José de Apalta Single Vineyard', nota: 'Carignan', precio: 15500 },
            { nombre: 'Casillero del Diablo Reserva', nota: 'Pinot noir', precio: 12900 },
            { nombre: 'San José de Apalta Reserva', nota: 'Syrah', precio: 11500 },
          ],
        },
        {
          titulo: 'Ensamblaje',
          platos: [
            { nombre: 'Kuru Gran Reserva', nota: 'Carmenere, syrah, cabernet sauvignon y petit verdot', precio: 18900 },
            { nombre: 'Diablo Red Reserva', precio: 18300 },
          ],
        },
        {
          titulo: 'Sauvignon blanc',
          platos: [
            { nombre: 'The Wine Gran Reserva', precio: 23800 },
            { nombre: 'San José de Apalta Nuba Gran Reserva', precio: [19500, 5500] },
          ],
        },
        {
          titulo: 'Chardonnay',
          platos: [
            { nombre: 'Marqués de Casa Concha Gran Reserva', precio: 32500 },
            { nombre: 'San José de Apalta Reserva', precio: 11500 },
          ],
        },
        {
          titulo: 'Late harvest y espumantes',
          platos: [
            { nombre: 'San José de Apalta Late Harvest', nota: '500 ml', precio: 11500 },
            { nombre: 'San José de Apalta Espumoso', precio: 15900 },
            { nombre: 'Cono Sur Sparkling', nota: 'Brut o rosé', precio: 13900 },
          ],
        },
      ],
    },
  ],
};

export const clp = (n: number) => '$' + n.toLocaleString('es-CL');
