package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of generation of AST Node and code syntax for infix expression
 * for C/Java/Python programs. For infix expression, syntax for all these 3 programming languages
 * will be exactly the same except for the scope of operators.
 */
public class ASTExpressionInfixOperation extends ASTExpression{
	private static final String NODE_TYPE = "Infix Operation";
	private ASTExpressionUnitOperator op;
	private ASTExpression identifier1;
	private ASTExpression identifier2;
	public ASTExpressionInfixOperation(){
		super();
	}

	public ASTExpressionInfixOperation(String operator,ASTExpression id1,ASTExpression id2) {
		this();
		this.op =  new ASTExpressionUnitOperator(operator);
		this.identifier1 = id1;
		this.identifier2 = id2;
		
		this.op.addParent(this);
		this.identifier1.addParent(this);;
		this.identifier2.addParent(this);
	}
	public boolean isValid(int currentProgrammingLanguage){
		return (this.usability&(1<<currentProgrammingLanguage))!=0;
	}
	public String toSyntax() {
		this.result = identifier1.toSyntax() + " "+this.op.toSyntax() +" "+ identifier2.toSyntax();
		return this.result;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}

}
