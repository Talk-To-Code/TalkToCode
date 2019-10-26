package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction AST nodes for statements that only consists 
 * 1 expression in C/Java/Python Program
 *
 */
public class ASTExpressionStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Expression Statement";
	protected ASTExpression exp;
	public ASTExpressionStatement(ASTExpression exp){
		super();
		this.exp = exp;
		exp.addParent(this);
	}
	//virtual method
	public String toSyntax(){
		this.result = this.exp.toSyntax();
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
