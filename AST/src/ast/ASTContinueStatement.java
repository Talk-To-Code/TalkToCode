package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is main for construction of AST node representing a continue statement
 */
public class ASTContinueStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Continue Statement";
	public ASTContinueStatement() {	
		super();
	}
	//virtual method
	public String toSyntax(){
		this.result = "continue";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
