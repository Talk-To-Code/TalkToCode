package ast;

/**
 * @author GAO RISHENG A0101891L This class is mainly syntax construction for
 *         break statement in Python programming language.
 *
 */
public class ASTBreakStatementP extends ASTBreakStatement {
	// Since python does not support break (LABEL), therefore only simple break
	// statement will be created
	public ASTBreakStatementP() {
		super();
	}

	public String toSyntax() {
		this.result = super.toSyntax() + "\n";
		return this.result;
	}
}
