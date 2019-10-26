package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of generation of AST Node and code syntax for postfix expression
 * for C/Java programs(++/--). For postfix expression, syntax for all these 2 programming languages
 * will be exactly the same. (PYTHON does not support postfix expression)
 */

public class ASTExpressionPostfixOperation extends ASTExpression{
	private static final String NODE_TYPE = "Postfix Operation";
	private ASTExpressionUnitOperator op;
	private ASTExpressionUnitIdentifier identifier1;
	/**
	 * @deprecated attribute to indicate the availability of postfix expression among 3
	 * programming languages using bit mask
	 */
	private int usability;
	public ASTExpressionPostfixOperation(){
		super();
	}

	public ASTExpressionPostfixOperation(String operator,ASTExpressionUnitIdentifier id1){
		this();
		this.op = new ASTExpressionUnitOperator(operator);
		this.identifier1 = id1;
		this.op.addParent(this);
		this.identifier1.addParent(this);
	}
	/**
	 * @deprecated method to indicate the availability of postfix expression among 3
	 * programming languages
	 */
	public boolean isValid(int currentProgrammingLanguage){
		return (currentProgrammingLanguage&(1<<this.usability))!=0;
	}
	public String toSyntax() {
		this.result = identifier1.toSyntax() + this.op.toSyntax();
		if(this.isQuoted) quote();
		return this.result;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}

}
