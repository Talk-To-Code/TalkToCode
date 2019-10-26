package ast;

/**
 * @author GAO RISHENG
 * this class is in charge of syntax generation of return statement 
 * in C programs
 *
 */
public final class ASTReturnStatementC extends ASTReturnStatement {
	private ASTExpression exp;
	public ASTReturnStatementC(){
		super();
		this.exp = null;
	}
	public void addExp(ASTExpression exp){
		
		this.exp = exp;
		exp.addParent(this);
	}
	
	public String toSyntax(){
		this.result = "return";
		if(this.exp!=null){
			this.result += " "+this.exp.toSyntax();
		}
		this.result+=";\n";
		return this.result;
	}
}
