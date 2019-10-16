package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is the combination(super class) of ASTBlockStatement and ASTSimpleStatement
 * that represents all currently supported statement type in this project.
 *
 */
public class ASTStatement extends ASTNode {
	private static final String NODE_TYPE = "Statement";
	public ASTStatement(){
		super();
	}
	//virtual method
	public String toSyntax(){
		this.result = "\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
