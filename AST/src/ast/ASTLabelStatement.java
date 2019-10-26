package ast;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of AST node generation and syntax generation of 
 * Label statement in C/Java Programs e.g (LOOP : statement etc)
 * (Python does not support label)
 */
public class ASTLabelStatement extends ASTSimpleStatement{
	private static final String NODE_TYPE = "Label";
	private ASTExpressionUnitIdentifier id;
	public ASTLabelStatement(ASTExpressionUnitIdentifier id) {
		super();
		this.id = id;
		id.addParent(this);
	}
	public String toSyntax(){
		this.result = this.id.toSyntax()+":\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
