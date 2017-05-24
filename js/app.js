// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

/**
 * @preserve  textfill
 * @name      jquery.textfill.js
 * @author    Russ Painter
 * @author    Yu-Jie Lin
 * @author    Alexandre Dantas
 * @version   0.6.0
 * @date      2014-08-19
 * @copyright (c) 2014 Alexandre Dantas
 * @copyright (c) 2012-2013 Yu-Jie Lin
 * @copyright (c) 2009 Russ Painter
 * @license   MIT License
 * @homepage  https://github.com/jquery-textfill/jquery-textfill
 * @example   http://jquery-textfill.github.io/jquery-textfill/index.html
 */
; (function($) {

	/**
	 * Resizes an inner element's font so that the
	 * inner element completely fills the outer element.
	 *
	 * @param {Object} options User options that take
	 *                         higher precedence when
	 *                         merging with the default ones.
	 *
	 * @return All outer elements processed
	 */
	$.fn.textfill = function(options) {

		// ______  _______ _______ _______ _     _        _______ _______
		// |     \ |______ |______ |_____| |     | |         |    |______
		// |_____/ |______ |       |     | |_____| |_____    |    ______|
        //
		// Merging user options with the default values

		var defaults = {
			debug            : false,
			maxFontPixels    : 40,
			minFontPixels    : 4,
			innerTag         : 'span',
			widthOnly        : false,
			success          : null, // callback when a resizing is done
			callback         : null, // callback when a resizing is done (deprecated, use success)
			fail             : null, // callback when a resizing is failed
			complete         : null, // callback when all is done
			explicitWidth    : null,
			explicitHeight   : null,
			changeLineHeight : false
		};

		var Opts = $.extend(defaults, options);

		// _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
		// |______ |     | | \  | |          |      |   |     | | \  | |______
		// |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|
		//
		// Predefining the awesomeness

		// Output arguments to the Debug console
		// if "Debug Mode" is enabled
		function _debug() {
			if (!Opts.debug
				||  typeof console       == 'undefined'
				||  typeof console.debug == 'undefined') {
				return;
			}
			console.debug.apply(console, arguments);
		}

		// Output arguments to the Warning console
		function _warn() {
			if (typeof console      == 'undefined' ||
				typeof console.warn == 'undefined') {
				return;
			}
			console.warn.apply(console, arguments);
		}

		// Outputs all information on the current sizing
		// of the font.
		function _debug_sizing(prefix, ourText, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			function _m(v1, v2) {

				var marker = ' / ';

				if (v1 > v2)
					marker = ' > ';

				else if (v1 == v2)
					marker = ' = ';

				return marker;
			}

			_debug(
				'[TextFill] '  + prefix + ' { ' +
				'font-size: ' + ourText.css('font-size') + ',' +
				'Height: '    + ourText.height() + 'px ' + _m(ourText.height(), maxHeight) + maxHeight + 'px,' +
				'Width: '     + ourText.width()  + _m(ourText.width() , maxWidth)  + maxWidth + ',' +
				'minFontPixels: ' + minFontPixels + 'px, ' +
				'maxFontPixels: ' + maxFontPixels + 'px }'
			);
		}

		/**
		 * Calculates which size the font can get resized,
		 * according to constrains.
		 *
		 * @param {String} prefix Gets shown on the console before
		 *                        all the arguments, if debug mode is on.
		 * @param {Object} ourText The DOM element to resize,
		 *                         that contains the text.
		 * @param {function} func Function called on `ourText` that's
		 *                        used to compare with `max`.
		 * @param {number} max Maximum value, that gets compared with
		 *                     `func` called on `ourText`.
		 * @param {number} minFontPixels Minimum value the font can
		 *                               get resized to (in pixels).
		 * @param {number} maxFontPixels Maximum value the font can
		 *                               get resized to (in pixels).
		 *
		 * @return Size (in pixels) that the font can be resized.
		 */
		function _sizing(prefix, ourText, func, max, maxHeight, maxWidth, minFontPixels, maxFontPixels) {

			_debug_sizing(
				prefix, ourText,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// The kernel of the whole plugin, take most attention
			// on this part.
			//
			// This is a loop that keeps increasing the `font-size`
			// until it fits the parent element.
			//
			// - Start from the minimal allowed value (`minFontPixels`)
			// - Guesses an average font size (in pixels) for the font,
			// - Resizes the text and sees if its size is within the
			//   boundaries (`minFontPixels` and `maxFontPixels`).
			//   - If so, keep guessing until we break.
			//   - If not, return the last calculated size.
			//
			// I understand this is not optimized and we should
			// consider implementing something akin to
			// Daniel Hoffmann's answer here:
			//
			//     http://stackoverflow.com/a/17433451/1094964
			//

			while (minFontPixels < (maxFontPixels - 1)) {

				var fontSize = Math.floor((minFontPixels + maxFontPixels) / 2);
				ourText.css('font-size', fontSize);

				if (func.call(ourText) <= max) {
					minFontPixels = fontSize;

					if (func.call(ourText) == max)
						break;
				}
				else
					maxFontPixels = fontSize;

				_debug_sizing(
					prefix, ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}

			ourText.css('font-size', maxFontPixels);

			if (func.call(ourText) <= max) {
				minFontPixels = maxFontPixels;

				_debug_sizing(
					prefix + '* ', ourText,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);
			}
			return minFontPixels;
		}

		// _______ _______ _______  ______ _______
		// |______    |    |_____| |_____/    |
		// ______|    |    |     | |    \_    |
        //
		// Let's get it started (yeah)!

		_debug('[TextFill] Start Debug');

		this.each(function() {

			// Contains the child element we will resize.
			// $(this) means the parent container
			var ourText = $(Opts.innerTag + ':visible:first', this);

			// Will resize to this dimensions.
			// Use explicit dimensions when specified
			var maxHeight = Opts.explicitHeight || $(this).height();
			var maxWidth  = Opts.explicitWidth  || $(this).width();

			var oldFontSize = ourText.css('font-size');

			var lineHeight  = parseFloat(ourText.css('line-height')) / parseFloat(oldFontSize);

			_debug('[TextFill] Inner text: ' + ourText.text());
			_debug('[TextFill] All options: ', Opts);
			_debug('[TextFill] Maximum sizes: { ' +
				   'Height: ' + maxHeight + 'px, ' +
				   'Width: '  + maxWidth  + 'px' + ' }'
				  );

			var minFontPixels = Opts.minFontPixels;

			// Remember, if this `maxFontPixels` is negative,
			// the text will resize to as long as the container
			// can accomodate
			var maxFontPixels = (Opts.maxFontPixels <= 0 ?
								 maxHeight :
								 Opts.maxFontPixels);


			// Let's start it all!

			// 1. Calculate which `font-size` would
			//    be best for the Height
			var fontSizeHeight = undefined;

			if (! Opts.widthOnly)
				fontSizeHeight = _sizing(
					'Height', ourText,
					$.fn.height, maxHeight,
					maxHeight, maxWidth,
					minFontPixels, maxFontPixels
				);

			// 2. Calculate which `font-size` would
			//    be best for the Width
			var fontSizeWidth = undefined;

			fontSizeWidth = _sizing(
				'Width', ourText,
				$.fn.width, maxWidth,
				maxHeight, maxWidth,
				minFontPixels, maxFontPixels
			);

			// 3. Actually resize the text!

			if (Opts.widthOnly) {
				ourText.css({
					'font-size'  : fontSizeWidth,
					'white-space': 'nowrap'
				});

				if (Opts.changeLineHeight)
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeWidth + 'px')
					);
			}
			else {
				var fontSizeFinal = Math.min(fontSizeHeight, fontSizeWidth);

				ourText.css('font-size', fontSizeFinal);

				if (Opts.changeLineHeight)
					ourText.parent().css(
						'line-height',
						(lineHeight * fontSizeFinal) + 'px'
					);
			}

			_debug(
				'[TextFill] Finished { ' +
				'Old font-size: ' + oldFontSize              + ', ' +
				'New font-size: ' + ourText.css('font-size') + ' }'
			);

			// Oops, something wrong happened!
			// We weren't supposed to exceed the original size
			if ((ourText.width()  > maxWidth) ||
				(ourText.height() > maxHeight && !Opts.widthOnly)) {

				ourText.css('font-size', oldFontSize);

				// Failure callback
				if (Opts.fail)
					Opts.fail(this);

				_debug(
					'[TextFill] Failure { ' +
					'Current Width: '  + ourText.width()  + ', ' +
					'Maximum Width: '  + maxWidth         + ', ' +
					'Current Height: ' + ourText.height() + ', ' +
					'Maximum Height: ' + maxHeight        + ' }'
				);
			}
			else if (Opts.success) {
				Opts.success(this);
			}
			else if (Opts.callback) {
				_warn('callback is deprecated, use success, instead');

				// Success callback
				Opts.callback(this);
			}
		});

		// Complete callback
		if (Opts.complete)
			Opts.complete(this);

		_debug('[TextFill] End Debug');
		return this;
	};

})(window.jQuery);


var tab0 = [
	"Caros amigos, ",
	"Por outro lado, ",
	"Assim mesmo, ",
	"No entanto, não podemos esquecer que ",
	"Do mesmo modo, ",
	"A prática cotidiana prova que ",
	"Nunca é demais lembrar o peso e o significado destes problemas, uma vez que ",
	"As experiências acumuladas demonstram que ",
	"Acima de tudo, é fundamental ressaltar que ",
	"O incentivo ao avanço tecnológico, assim como ",
	"Não obstante, ",
	"Todas estas questões, devidamente ponderadas, levantam dúvidas sobre se ",
	"Pensando mais a longo prazo, ",
	"O que temos que ter sempre em mente é que ",
	"Ainda assim, existem dúvidas a respeito de como ",
	"Gostaria de enfatizar que ",
	"Todavia, ",
	"A nível organizacional, ",
	"O empenho em analisar ",
	"Percebemos, cada vez mais, que ",
	"No mundo atual, ",
	"É importante questionar o quanto ",
	"Neste sentido, ",
	"Evidentemente, ",
	"Por conseguinte, ",
	"É claro que ",
	"Podemos já vislumbrar o modo pelo qual ",
	"Desta maneira, ",
	"O cuidado em identificar pontos críticos n",
	"A certificação de metodologias que nos auxiliam a lidar com "
];

var tab1 = [
	"a execução dos pontos do programa ",
	"a complexidade dos estudos efetuados ",
	"a contínua expansão de nossa atividade ",
	"a estrutura atual da organização ",
	"o novo modelo estrutural aqui preconizado ",
	"o desenvolvimento contínuo de distintas formas de atuação ",
	"a constante divulgação das informações ",
	"a consolidação das estruturas ",
	"a consulta aos diversos militantes ",
	"o início da atividade geral de formação de atitudes ",
	"o desafiador cenário globalizado ",
	"a mobilidade dos capitais internacionais ",
	"o fenômeno da Internet ",
	"a hegemonia do ambiente político ",
	"a expansão dos mercados mundiais ",
	"o aumento do diálogo entre os diferentes setores produtivos ",
	"a crescente influência da mídia ",
	"a necessidade de renovação processual ",
	"a competitividade nas transações comerciais ",
	"o surgimento do comércio virtual ",
	"a revolução dos costumes ",
	"o acompanhamento das preferências de consumo ",
	"o comprometimento entre as equipes ",
	"a determinação clara de objetivos ",
	"a adoção de políticas descentralizadoras ",
	"a valorização de fatores subjetivos ",
	"a percepção das dificuldades ",
	"o entendimento das metas propostas ",
	"o consenso sobre a necessidade de qualificação ",
	"o julgamento imparcial das eventualidades "
];

var tab2 = [
	"nos obriga à análise ",
	"cumpre um papel essencial na formulação ",
	"exige a precisão e a definição ",
	"auxilia a preparação e a composição ",
	"garante a contribuição de um grupo importante na determinação ",
	"assume importantes posições no estabelecimento ",
	"facilita a criação ",
	"obstaculiza a apreciação da importância ",
	"oferece uma interessante oportunidade para verificação ",
	"acarreta um processo de reformulação e modernização ",
	"pode nos levar a considerar a reestruturação ",
	"representa uma abertura para a melhoria ",
	"ainda não demonstrou convincentemente que vai participar na mudança ",
	"talvez venha a ressaltar a relatividade ",
	"prepara-nos para enfrentar situações atípicas decorrentes ",
	"maximiza as possibilidades por conta ",
	"desafia a capacidade de equalização ",
	"agrega valor ao estabelecimento ",
	"é uma das consequências ",
	"promove a alavancagem ",
	"não pode mais se dissociar ",
	"possibilita uma melhor visão global ",
	"estimula a padronização ",
	"aponta para a melhoria ",
	"faz parte de um processo de gerenciamento ",
	"causa impacto indireto na reavaliação ",
	"apresenta tendências no sentido de aprovar a manutenção ",
	"estende o alcance e a importância ",
	"deve passar por modificações independentemente ",
	"afeta positivamente a correta previsão "
];

var tab3 = [
	"das condições financeiras e administrativas exigidas.",
	"das diretrizes de desenvolvimento para o futuro.",
	"do sistema de participação geral.",
	"das posturas dos órgãos dirigentes com relação às suas atribuições.",
	"das novas proposições.",
	"das direções preferenciais no sentido do progresso.",
	"do sistema de formação de quadros que corresponde às necessidades.",
	"das condições inegavelmente apropriadas.",
	"dos índices pretendidos.",
	"das formas de ação.",
	"dos paradigmas corporativos.",
	"dos relacionamentos verticais entre as hierarquias.",
	"do processo de comunicação como um todo.",
	"dos métodos utilizados na avaliação de resultados.",
	"de todos os recursos funcionais envolvidos.",
	"dos níveis de motivação departamental.",
	"da gestão inovadora da qual fazemos parte.",
	"dos modos de operação convencionais.",
	"de alternativas às soluções ortodoxas.",
	"dos procedimentos normalmente adotados.",
	"dos conhecimentos estratégicos para atingir a excelência.",
	"do fluxo de informações.",
	"do levantamento das variáveis envolvidas.",
	"das diversas correntes de pensamento.",
	"do impacto na agilidade decisória.",
	"das regras de conduta normativas.",
	"do orçamento setorial.",
	"do retorno esperado a longo prazo.",
	"do investimento em reciclagem técnica.",
	"do remanejamento dos quadros funcionais."
];

var styles = [
	"herzog",
	"nietzsche",
	"bringhurst",
	// "thin", // Uma bosta de estilo para smartphones. Considere eliminar
	"nabokov",
	"seneca",
	"tufte",
	"postnormal",
	"slogan",
	"darwin",
	"headline",
	"camus"
];

var $window = $(window);
var $body = $("body");
var $button = $("#generate-btn");
var $mainContainer = $("#main-container");
var $textContainer = $("#text-container");
var $mainParagraph = $("#main-paragraph");
// var $sample = $("#sample");
var $footer = $("footer");

function randomElement(anArray) {
	var index = Math.floor(Math.random()*anArray.length);
	return anArray[index];
}

function randomParagraph() {
	return (
		randomElement(tab0)+
		randomElement(tab1)+
		randomElement(tab2)+
		randomElement(tab3)
	);
}

function randomHome() {
	$mainParagraph.text(randomParagraph());
	var style = randomElement(styles)
	$mainContainer.removeClass($mainContainer.attr("class")).addClass(style);
	setTimeout(fitText, 100);
}

function fitText () {
	$textContainer.textfill({maxFontPixels: 0});
	console.log("FIT!");
}

$button.click(randomHome);
$(document).keypress(function (event){
	//barra de espaço gera novo lerolero
	if (event.which == 32) {
		randomHome();
	}
});
$window.resize(fitText);

randomHome();
//# sourceMappingURL=app.js.map
