
function calculate(expression) {

    var operators = { };
    operators['+'] = [0];
    operators['-'] = [0];
    operators['*'] = [1];
    operators['/'] = [1];

    // check whether given token is operator or not
    function isOperator(token) {
        if (operators[token])
            return true;
        return false;
    }

    // compare precedence of operators (which of them should be calculated first)
    function comparePrecedence(token1, token2) {
        if (!isOperator(token1))
            throw new Error("Invalid token: " + token);
        if (!isOperator(token2))
            throw new Error("Invalid token: " + token);
        return operators[token1][0] - operators[token2][0];
    }

    // look up value in last cell in a stack
    function peek(array) {
        if (array.length > 0)
            return array[array.length - 1];
        return null;
    }

    // take input string and return array of tokens or null if the input is incorrect
    function tokenizeInput(input) {

        var expression = input.replace(/\s/g, '');
        console.log(expression);
        // first we get rid of any invalid characters
        if (/[^0-9+\-/*()]/g.test(expression))
            return null;

        // if string ends or startswith either of those
        // ('+', '-', '*', '/', '(') it must be incorrect
        // NOTE: '-' is allowed at the beginning as it means negative number
        if (/[+\-*/\(]/.test(expression.charAt(expression.length - 1)) || /[.+*/\)]/.test(expression.charAt(0)))
            return null;

        // find places where negation occurs (i.e. '(-3)'') and place zeros before minuses
        var indexesForZeros = [];
        for (var i = 0; i < expression.length; i++)
            if (expression.charAt(i) === '(' && expression.charAt(i + 1) === '-')
                indexesForZeros.push(i + 1);

        for (var i = 0; i < indexesForZeros.length; i++) {
            expression = expression.slice(0, indexesForZeros[i]) + '0' + expression.slice(indexesForZeros[i]);
        }

        // special case where negation happens at the beginning of input
        if (expression.charAt(0) === '-')
            expression = '0' + expression;

        var tokens = [];
        var parentheses = 0;
        var currentNumber = '';
        var areWeInsideANumber = false;
        var wasPreviousTokenOperator = false;

        for (var i = 0; i < expression.length; i++) {
            var a = expression.charAt(i);

            if (/[+\-/*]/.test(a)) {
                // previous token was an operator and this one is so there are
                // two operators after each other and the input is invalid
                if (wasPreviousTokenOperator)
                    return null;

                wasPreviousTokenOperator = true;
            } else {
                wasPreviousTokenOperator = false;
            }

            // check if current char is a number
            if (/[0-9]/.test(a)) {
                areWeInsideANumber = true;
                currentNumber += a;
            // or an operator (including brackets)
            } else if (/[+\-/*^()]/.test(a)) {

                areWeInsideANumber = false;

                if (currentNumber !== '')
                    tokens.push(currentNumber);

                currentNumber = '';

                tokens.push(a);
            }

            if (a === '(') parentheses++;
            if (a === ')') parentheses--;
        }

        // parentheses is broken
        if (parentheses != 0)
            return null;

        // add last number to the tokens array
        tokens.push(currentNumber);
        return tokens;
    }

    function infixToPostfix(tokens) {
        var out = [];
        var stack = [];

        for (var i = 0; i < tokens.length; i++) {
            if (isOperator(tokens[i])) {
                while (stack.length > 0 && isOperator(peek(stack))) {
                    if (comparePrecedence(tokens[i], peek(stack)) <= 0)
                    {
                        out.push(stack.pop());
                        continue;
                    }
                    break;
                }
                stack.push(tokens[i]);
            } else if (tokens[i] == '(') {
                stack.push(tokens[i]);
            } else if (tokens[i] == ')') {
                while (stack.length > 0 && peek(stack) != '(') {
                    out.push(stack.pop());
                }
                stack.pop();
            } else {
                out.push(tokens[i]);
            }
        }
        while (stack.length > 0) {
            out.push(stack.pop());
        }

        // filter empty tokens
        out = out.filter(Boolean);

        return out;
    }

    // calculate Polish notation
    function calculateRpn(tokens) {
        tokens = tokens.reverse();
        var stack = [];

        while (tokens.length > 0) {

            var a = tokens.pop();

            if (/[^+\-/*]/g.test(a)) {
                stack.push(a);
            } else {
                // not enough values on stack
                if (stack.length < 2) {
                    return null;
                } else {
                    var c = Number(stack.pop());
                    var b = Number(stack.pop());
                    var d = 0;
                    switch (a) {
                        case '+':
                            d = b + c; 
                            break;

                        case '-':
                            d = b - c;
                            break;

                        case '*':
                            d = b * c;
                            break;

                        case '/':
                            d = b / c;
                            break;
                    }
                    stack.push(d);
                }
            }
        }

        if (stack.length === 1) {
            return Number(stack.pop());
        }

        return null;
    }

    if (expression.length === 0)
        return null;

    var tokens = tokenizeInput(expression);
    if (tokens === null)
        return 'Incorrect expression';

    var out = infixToPostfix(tokens);

    var result = calculateRpn(out);
    if (result === null)
        return 'Incorrect expression';

    return result;
}
