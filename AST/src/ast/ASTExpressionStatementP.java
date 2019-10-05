package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction syntax for statements that only consists 
 * 1 expression in Python Program
 *
 */
public final class ASTExpressionStatementP extends ASTExpressionStatement {

	public ASTExpressionStatementP(ASTExpression exp) {
		super(exp);
	}
	public String toSyntax(){
		this.result = super.toSyntax()+"\n";
		return this.result;
	}
}
