package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction syntax for statements that only consists 
 * 1 expression in C Program
 *
 */
public final class ASTExpressionStatementC extends ASTExpressionStatement {
	public ASTExpressionStatementC(ASTExpression p) {
		super(p);
		
	}
	
	public String toSyntax(){
		this.result = this.exp.toSyntax()+";\n";
		return this.result;
	}
}
