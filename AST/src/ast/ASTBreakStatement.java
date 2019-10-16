package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for construction of ASTNode that represents the break statement in the program.
 *
 */
public class ASTBreakStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Break Statement";
	public ASTBreakStatement() {	
		super();
	}
	//virtual  method
	public String toSyntax(){
		this.result = "break";
		return this.result;
	}
	//virtual method
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
