package ast;

/**
 * @author GAO RISHENG A0101891L This class is mainly syntax construction for
 *         break statement in Java programming language.
 *
 */
public final class ASTBreakStatementJ extends ASTBreakStatement {
	// Since C and Java supports break (label), therefore, this identifier
	// specifies which label is going to break
	ASTExpressionUnitIdentifier label;
	public ASTBreakStatementJ() {
		super();
		this.label = null;
	}
	public ASTBreakStatementJ(ASTExpressionUnitIdentifier label) {
		this.label = label;
		label.addParent(this);
	}
	//Actual code construction for Java break statement.
	public String toSyntax(){
		if(this.label == null)
			this.result = super.toSyntax()+";\n";
		else{
			this.result = super.toSyntax()+" "+this.label.toSyntax()+";\n";
		}
		return this.result;
	}
}
