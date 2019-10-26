package ast;

/**
 * @author GAO RISHENG
 * this class is in charge of syntax generation of return statement 
 * in Java programs
 *
 */
public class ASTReturnStatementJ extends ASTReturnStatement {
	private ASTExpression exp;
	public ASTReturnStatementJ(ASTExpression exp){
		super();
		this.exp = exp;
		exp.addParent(this);
	}
	
	
	public String toSyntax(){
		this.result = "return";
		this.result += " "+this.exp.toSyntax();
		this.result+=";\n";
		return this.result;
	}
}
