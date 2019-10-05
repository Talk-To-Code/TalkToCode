package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is main for construction of AST node representing a continue statement in C program
 */
public class ASTContinueStatementC extends ASTContinueStatement {
	public ASTContinueStatementC() {
		super();
	}

	//continue statement syntax generation
	public String toSyntax(){
		this.result = super.toSyntax()+";\n";
		return this.result;
	}
}
