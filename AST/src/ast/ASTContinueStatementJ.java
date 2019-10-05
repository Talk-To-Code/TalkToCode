package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is main for construction of AST node representing a continue statement in Java
 */
public class ASTContinueStatementJ extends ASTContinueStatement {
	//Java supports continue (label)
	ASTExpressionUnitIdentifier label;
	public ASTContinueStatementJ() {
		super();
		this.label = null;
	}
	public ASTContinueStatementJ(ASTExpressionUnitIdentifier label) {
		this();
		this.label = label;
		label.addParent(this);
	}
	//syntax construction
	public String toSyntax(){
		if(this.label == null)
			this.result = super.toSyntax()+";\n";
		else{
			this.result = super.toSyntax()+" "+this.label.toSyntax()+";\n";
		}
		return this.result;
	}
}
