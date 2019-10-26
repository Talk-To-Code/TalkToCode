package ast;

/**
 * @author GAO RISHENG A0101891L This class is mainly syntax construction for
 *         break statement in C programming language.
 *
 */
public final class ASTBreakStatementC extends ASTBreakStatement {
	// Since C and Java supports break (label), therefore, this identifier
	// specifies which label is going to break
	ASTExpressionUnitIdentifier label;

	public ASTBreakStatementC() {
		super();
		this.label = null;
	}

	public ASTBreakStatementC(ASTExpressionUnitIdentifier label) {
		this.label = label;
		label.addParent(this);
	}

	public void setLabel(ASTExpressionUnitIdentifier label) {
		this.label = label;
		label.addParent(this);
	}
	//Actual code construction for C break statement.
	public String toSyntax() {
		if (this.label == null)
			//this will return "break;\n"
			this.result = super.toSyntax() + ";\n";
		else {
			//this will return "break LABEL_NAME;\n"
			this.result = super.toSyntax() + " " + this.label.toSyntax() + ";\n";
		}
		return this.result;
	}
}
