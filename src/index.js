import EditorJS from './editor.js/dist/editorjs.mjs';

if (window.DEBUG)
    new EventSource('/esbuild').addEventListener('change', () => location.reload())

class MathBlock {
    static MQ = MathQuill.getInterface(2)

    constructor({ data }) {
        this.data = data
        this.wrapper = undefined
        this.mathFieldDiv = undefined
        this.mathField = undefined
    }

    static get toolbox() {
        return {
            title: "Math",
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        }
    }
    render() {
        this.wrapper = document.createElement('div')
        this.mathFieldDiv = document.createElement('div')

        this.mathFieldDiv.addEventListener('focusin', () => {
            window.secretStuff = true
        })

        this.mathField = MathBlock.MQ.MathField(this.mathFieldDiv, {
            spaceBehavesLikeTab: true,
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            sumStartsWithNEquals: true,
            supSubsRequireOperand: true,
            charsThatBreakOutOfSupSub: '=<>',
            autoSubscriptNumerals: true,
            autoCommands: 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega sqrt sum prod int',
            autoOperatorNames: 'sin cos tan log ln cosh sinh tanh',
            maxDepth: 10,
            // substituteTextarea: function() {
            //   return document.createElement('textarea');
            // },
            handlers: {
            //   edit: function(mathField) { ... },
            //   upOutOf: function(mathField) { ... },
              moveOutOf: function(dir, mathField) { 
                window.secretStuff = false
             },
             upOutOf: function(mathField) {
                window.secretStuff = false
             },
             downOutOf: function(mathField) {
                window.secretStuff = false
             }
            }
          })

        if (this.data && this.data.mathContent) {
            this.mathField.latex(this.data.mathContent)
        }

        this.wrapper.appendChild(this.mathFieldDiv)

        this.wrapper.classList.add('cdx-block')

        return this.wrapper
    }

    save() {
        return {
            mathContent: this.mathField.latex()
        }
    }
}

window.onload = () => {
    // let runButton = document.getElementById('runButton')
    // let input = document.getElementById('inputText')
    // let output = document.getElementById('output')
    // runButton.onclick = () => {
    //     output.innerHTML = (new Function(input.value))()
    // }

    // let MQ = MathQuill.getInterface(2)
    // MQ.MathField($('#inputMath')[0], {
    //     autoCommands: 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega sum infinity',
    //     autoOperatorNames: 'sin cos'
    // })

    let data
    try {
        data = JSON.parse(localStorage.getItem('save'))
    }
    catch {
        data = undefined
    }

    const editor = new EditorJS({
        holder: 'editorjs',
        data: data,
        autofocus: true,
        tools: {
            math: MathBlock
        },
        onChange: () => {
            editor.save().then((outputData) => {
                console.log('Article data: ', outputData)
                localStorage.setItem('save', JSON.stringify(outputData))
            }).catch((error) => {
                console.log('Saving failed: ', error)
            });
        }
    });
}