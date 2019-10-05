package ast;


/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of generation of AST Node and code syntax for prefix expression
 * for C/Java programs(++/--). For prefix expression, syntax for all these 2 programming languages
 * will be exactly the same with different operator scope like '&' in C. 
 * (PYTHON does not support prefix expression)
 * Assumption:
 * quoted prefix operation like (i++) are not supported
 */
public class ASTExpressionPrefixOperation extends ASTExpression{
	private static final String NODE_TYPE = "Prefix Operation";
	
	private ASTExpressionUnitOperator op;
	private ASTExpression identifier1;
	
	/**
	 * @deprecated attribute to indicate the availability of postfix expression among 3
	 * programming languages using bit mask
	 */
	private int usability;
	public ASTExpressionPrefixOperation(){
		super();
	}

	public ASTExpressionPrefixOperation(String operator,ASTExpressionUnitIdentifier id1){
		this();
		this.op = new ASTExpressionUnitOperator(operator);
		this.identifier1 = id1;

		this.op.addParent(this);
		this.identifier1.addParent(this);
	}
	public ASTExpressionPrefixOperation(String operator,ASTExpressionUnitLiteral id1){
		this();
		this.op = new ASTExpressionUnitOperator(operator);
		this.identifier1 = id1;

		this.op.addParent(this);
		this.identifier1.addParent(this);
	}
	public ASTExpressionPrefixOperation(String operator,ASTExpression id1){
		this();
		this.op = new ASTExpressionUnitOperator(operator);
		this.identifier1 = id1;

		this.op.addParent(this);
		this.identifier1.addParent(this);
	}
	/**
	 * @deprecated method to indicate the availability of prefix expression among 3
	 * programming languages
	 */
	public boolean isValid(int currentProgrammingLanguage){
		return (this.usability&(1<<currentProgrammingLanguage))!=0;
	}

	public String toSyntax() {
		this.result = this.op.toSyntax() + identifier1.toSyntax();
		return this.result;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
}
