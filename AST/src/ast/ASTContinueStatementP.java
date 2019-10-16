package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is main for construction of AST node representing a continue statement in Python
 */
public class ASTContinueStatementP extends ASTContinueStatement {
	public ASTContinueStatementP() {
		super();
	}
	//syntax construction
	public String toSyntax(){
		this.result = super.toSyntax()+"\n";
		return this.result;
	}
}
